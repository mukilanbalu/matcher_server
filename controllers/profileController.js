const HttpError = require("../models/httpError");
const supabase = require("../config/supabaseClient");
const { generateProfileId } = require("../utils");

function nestFields(data) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        const keys = key.split('.');
        keys.reduce((acc, k, i) => {
            if (i === keys.length - 1) {
                acc[k] = value;
            } else {
                acc[k] = acc[k] || {};
            }
            return acc[k];
        }, result);
    }
    return result;
}

const uploadFileToSupabase = async (fileBuffer, originalName, bucket, subId, mimetype) => {
    const fileExt = originalName.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const cleanSub = subId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = `${cleanSub}/${fileName}`;

    let { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileBuffer, { contentType: mimetype, upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
};

const createProfile = async (req, res, next) => {
    try {
        const rawProfile = typeof req.body.profileData === 'string' ? JSON.parse(req.body.profileData) : req.body;
        const profile = nestFields(rawProfile);

        const authId = req.auth?.sub || req.auth?.payload?.sub;
        if (!authId) throw new Error("Unauthorized: Missing user authentication ID");

        // handle profile images
        let profileImgUrls = [];
        if (req.files && req.files.profileImage) {
            profileImgUrls = await Promise.all(
                req.files.profileImage.map(f => uploadFileToSupabase(f.buffer, f.originalname, 'profile_images', authId, f.mimetype))
            );
        }

        // handle astro image
        let astroImgUrl = "";
        if (req.files && req.files.astroImage) {
            astroImgUrl = await uploadFileToSupabase(req.files.astroImage[0].buffer, req.files.astroImage[0].originalname, 'astro_images', authId, req.files.astroImage[0].mimetype);
        }

        // Sanitize profile_img to be an array
        let currentProfileImgs = [];
        if (Array.isArray(profile.profile_img)) {
            currentProfileImgs = profile.profile_img;
        } else if (typeof profile.profile_img === 'string' && profile.profile_img.trim() !== '') {
            currentProfileImgs = [profile.profile_img];
        }

        profile.profile_img = profileImgUrls.length ? [...currentProfileImgs, ...profileImgUrls] : currentProfileImgs;

        if (profile.astro) {
             profile.astro.img = astroImgUrl || profile.astro?.img || "";
        }

        // Generate unique profile ID
        const profileId = await generateProfileId();

        const { data, error } = await supabase
            .from('profiles')
            .insert([{ 
                ...profile, 
                auth_id: authId, 
                email: profile.email || req.auth?.payload?.email, 
                profile_id: profileId, 
                created_on: new Date() 
            }])
            .select();

        if (error) throw error;
        res.status(200).json({ data: data[0] });
    } catch (err) {
        return next(err);
    }
}

const getProfile = async (req, res, next) => {
    try {
        const email = req.body.email || req.query.email || req.params.email;
        const authId = req.auth?.sub || req.auth?.payload?.sub;
        
        let query = supabase.from('profiles').select('*');
        
        if (email) {
            query = query.eq('email', email);
        } else if (authId) {
            query = query.eq('auth_id', authId);
        } else {
            return res.status(400).json({ message: 'Email or AuthID required' });
        }

        const { data, error } = await query.single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return res.status(204).json({ message: 'Profile not found' });
        res.status(200).json({ data });
    } catch (err) {
        return next(err);
    }
}

const getProfiles = async (req, res, next) => {
    try {
        let { filters, isFullProfile } = req.body;
        let query = supabase.from('profiles').select('*', { count: 'exact' });

        // Exclude the current logged-in user's profile from list results (dashboard)
        // BUT allow it if searching for a specific email (own profile details)
        const authId = req.auth?.sub || req.auth?.payload?.sub;
        if (authId && (!filters || !filters.email)) {
            query = query.neq('auth_id', authId);
        }

        if (filters) {
            if (filters.email) {
                query = query.eq('email', filters.email);
            }
            if (filters.gender) {
                const genderValue = filters.gender.toLowerCase() === "bride" ? "Female" : (filters.gender.toLowerCase() === "groom" ? "Male" : filters.gender);
                query = query.eq('gender', genderValue);
            }
            if (filters.marital_status) {
                query = query.eq('marital_status', filters.marital_status);
            }

            if (filters.limit) query = query.limit(filters.limit);
            if (filters.skip) query = query.range(filters.skip, filters.skip + filters.limit - 1);
        }

        console.log('Searching profiles excluding authId if no direct filter:', authId);
        const { data, error, count } = await query;

        if (error) throw error;
        if (!data || data.length === 0) return res.status(204).json({ message: 'No profiles found' });
        res.status(200).json({ data, totalRec: count, is_completed: data.length > 0 });
    } catch (err) {
        return next(err);
    }
}

const editProfile = async (req, res, next) => {
    try {
        const rawProfile = typeof req.body.profileData === 'string' ? JSON.parse(req.body.profileData) : req.body;
        const profile = nestFields(rawProfile);

        const authId = req.auth?.sub || req.auth?.payload?.sub;
        if (!authId) throw new Error("Unauthorized: Missing user authentication ID");

        // handle profile images
        let profileImgUrls = [];
        if (req.files && req.files.profileImage) {
            profileImgUrls = await Promise.all(
                req.files.profileImage.map(f => uploadFileToSupabase(f.buffer, f.originalname, 'profile_images', authId, f.mimetype))
            );
        }

        let astroImgUrl = "";
        if (req.files && req.files.astroImage) {
            astroImgUrl = await uploadFileToSupabase(req.files.astroImage[0].buffer, req.files.astroImage[0].originalname, 'astro_images', authId, req.files.astroImage[0].mimetype);
        }

        // Sanitize profile_img to be an array
        let currentProfileImgs = [];
        if (Array.isArray(profile.profile_img)) {
            currentProfileImgs = profile.profile_img;
        } else if (typeof profile.profile_img === 'string' && profile.profile_img.trim() !== '') {
            currentProfileImgs = [profile.profile_img];
        }

        profile.profile_img = profileImgUrls.length ? [...currentProfileImgs, ...profileImgUrls] : currentProfileImgs;

        if (profile.astro) {
             profile.astro.img = astroImgUrl || profile.astro?.img || "";
        }

        const { data, error } = await supabase
            .from('profiles')
            .update(profile)
            .eq('auth_id', authId)
            .select();

        if (error) throw error;
        res.status(200).json({ data: data[0] });
    } catch (err) {
        return next(err);
    }
}

const deleteProfile = async (req, res, next) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('email', req.query.email);

        if (error) throw error;
        res.status(200).json({ message: 'Profile deleted' });
    } catch (err) {
        return next(err);
    }
}

exports.createProfile = createProfile;
exports.getProfile = getProfile;
exports.getProfiles = getProfiles;
exports.editProfile = editProfile;
exports.deleteProfile = deleteProfile;