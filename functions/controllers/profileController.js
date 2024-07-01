const HttpError = require("../models/httpError");
const user_profiles = require("../models/profileModel");


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
        const jsonString = JSON.stringify(req.body); // Assuming you want to update the first matching profile
        const profile = nestFields(JSON.parse(jsonString))

        // if (!profile.length) {
        //     const httpError = new HttpError("No data found", 204)
        //     return next(httpError);
        // }

        // Update the profile with new profile_img paths
        if (req.files['profile_img']) {
            profile.profile_img = req.files['profile_img'].map(file => file.path);
        }
        if (req.files['astro_img']) {
            profile.astro.img = req.files['astro_img'][0].path;
        }
        // Save the updated profile (if using Mongoose)
        console.log(profile)
        await user_profiles.create(profile);
        res.status(200).json({ data: { ...profile } });
    }
    catch (err) {
        return next(err);
    }

}

const getProfile = async (req, res, next) => {
    if (req.params.email) {
        try {
            const data = await user_profiles.find({});
            if (!data.length) {
                const httpError = new HttpError("No data found", 401)
                return next(httpError);
            }
            res.status(200).json({ data })

        } catch (err) {
            return next(err)
        }
    }
    res.send()

}




const getProfiles = async (req, res, next) => {
    // console.log("cal", req)
    // try {
    //     const data = await user_profiles.find({ email: req.query.email })
    //     if (!data.length) {
    //         const httpError = new HttpError("No data found", 401)
    //         return next(httpError);
    //     }
    //     res.status(200).json({ data });
    // }
    // catch (err) {
    //     return next(err);
    // }
    console.log(req.body)
    let payload = {};
    if (req.body) {
        payload = req.body.filters
        isFullProfile = req.body.isFullProfile;
    }
    try {
        let data = []
        if (isFullProfile) {
            data = await user_profiles.find(payload)

        } else {
            data = await user_profiles.find(payload)
                .select('name birth.age professional.education professional.job professional.location email profile_img');

        }

        if (!data.length) {
            const httpError = new HttpError("No data found", 204)
            return next(httpError);
        }
        res.status(200).json({ data })

    } catch (err) {
        return next(err)
    }
}

const editProfile = async (req, res, next) => {
    try {
        const data = await user_profiles.find({ email: req.body.email })
        if (!data.length) {
            const httpError = new HttpError("No data found", 204)
            return next(httpError);
        }
        // data.profile_img = req.files.map(file => file.path)
        const profileToUpdate = data[0]; // Assuming you want to update the first matching profile

        // Update the profile with new profile_img paths
        if (req.files['profile_img']) {
            profileToUpdate.profile_img = req.files['profile_img'].map(file => file.path);
        }
        if (req.files['astro_img']) {
            profileToUpdate.astro.img = req.files['astro_img'][0].path;
        }
        // Save the updated profile (if using Mongoose)
        // await profileToUpdate.save();
        res.status(200).json({ profileToUpdate });
    }
    catch (err) {
        return next(err);
    }
}

const deleteProfile = async (req, res, next) => {
    try {
        const data = await user_profiles.deleteOne({ email: req.query.email })
        if (!data.length) {
            const httpError = new HttpError("No data found", 401)
            return next(httpError);
        }
        res.status(200).json({ data });
    }
    catch (err) {
        return next(err);
    }
}
exports.createProfile = createProfile;
exports.getProfile = getProfile;
exports.getProfiles = getProfiles;
exports.editProfile = editProfile;
exports.deleteProfile = deleteProfile;