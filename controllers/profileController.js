const HttpError = require("../models/httpError");
const supabase = require("../config/supabaseClient");

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

const createProfile = async (req, res, next) => {
    try {
        const profile = nestFields(req.body);
        const { data, error } = await supabase
            .from('profiles')
            .insert([{ ...profile, id: req.auth.sub, email: req.auth.email }])
            .select();

        if (error) throw error;
        res.status(200).json({ data: data[0] });
    } catch (err) {
        return next(err);
    }
}

const getProfile = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', req.params.email)
            .single();

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

        console.log('Searching profiles with filters:', filters);
        const { data, error, count } = await query;
        console.log('Profiles found:', data?.length, 'Total:', count);

        if (error) throw error;
        if (!data || data.length === 0) return res.status(204).json({ message: 'No profiles found' });
        res.status(200).json({ data, totalRec: count });
    } catch (err) {
        return next(err);
    }
}

const editProfile = async (req, res, next) => {
    try {
        const profile = nestFields(req.body);
        const { data, error } = await supabase
            .from('profiles')
            .update(profile)
            .eq('email', req.body.email)
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