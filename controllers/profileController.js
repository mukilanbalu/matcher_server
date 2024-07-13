const HttpError = require("../models/httpError");
const user_profiles = require("../models/profileModel");
const getDateNDaysAgo = require("../utils")


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

function createQuery(obj) {
    const query = {
        $and: [],
    };

    for (const key in obj) {
        if (obj.hasOwnProperty(key) && key !== "limit" && key !== "skip") {
            const value = obj[key];

            // Transform gender
            if (key === "gender") {
                let genderValue = value;
                if (value.toLowerCase() === "bride") {
                    genderValue = "Female";
                } else if (value.toLowerCase() === "groom") {
                    genderValue = "Male";
                }
                query.$and.push({ gender: genderValue });
            }
            // Handle birth.age range
            else if (key === "birth.age" && Array.isArray(value) && value.length === 2) {
                const today = new Date();
                const minAgeDate = new Date(today.getFullYear() - value[1], today.getMonth(), today.getDate());
                const maxAgeDate = new Date(today.getFullYear() - value[0], today.getMonth(), today.getDate());

                // Convert dates to ISO string for comparison
                const minDateStr = minAgeDate.toISOString().split('T')[0];
                const maxDateStr = maxAgeDate.toISOString().split('T')[0];

                // Add a query to compare DOB strings directly
                query.$and.push({
                    $expr: {
                        $and: [
                            {
                                $gte: [
                                    {
                                        $dateFromString: {
                                            dateString: {
                                                $concat: [
                                                    { $substr: ["$birth.dob", 6, 4] },
                                                    "-",
                                                    { $substr: ["$birth.dob", 3, 2] },
                                                    "-",
                                                    { $substr: ["$birth.dob", 0, 2] }
                                                ]
                                            }
                                        }
                                    },
                                    { $dateFromString: { dateString: minDateStr } }
                                ]
                            },
                            {
                                $lte: [
                                    {
                                        $dateFromString: {
                                            dateString: {
                                                $concat: [
                                                    { $substr: ["$birth.dob", 6, 4] },
                                                    "-",
                                                    { $substr: ["$birth.dob", 3, 2] },
                                                    "-",
                                                    { $substr: ["$birth.dob", 0, 2] }
                                                ]
                                            }
                                        }
                                    },
                                    { $dateFromString: { dateString: maxDateStr } }
                                ]
                            }
                        ]
                    }
                });
            }
            else if (key === "created_on") {
                if (value !== "All") {
                    let dates = getDateNDaysAgo(parseInt(value));

                    // Add a query to compare created_on strings directly
                    query.$and.push({
                        $expr: {
                            $gte: [
                                {
                                    $dateFromString: {
                                        dateString: "$created_on",
                                        format: "%d/%m/%Y"
                                    }
                                },
                                {
                                    $dateFromString: {
                                        dateString: dates,
                                        format: "%d/%m/%Y"
                                    }
                                }
                            ]
                        }
                    });
                }

            }
            // Handle other fields
            else {
                query.$and.push({ [key]: value });
            }
        }
    }
    return query;
}
function hasMoreKeyValues(payload) {
    const keys = Object.keys(payload);
    return keys.length === 1 && keys[0] === "email";
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
        // if (req.files['profile_img']) {
        //     profile?.profile_img = req?.files['profile_img'].map(file => file.path);
        // }
        // if (req.files['astro_img']) {
        //     profile.astro.img = req.files['astro_img'][0].path;
        // }
        // Save the updated profile (if using Mongoose)
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
    let payload = {};
    let totalRec = "";
    if (req.body) {
        payload = req.body.filters
        isFullProfile = req.body.isFullProfile;
    }
    try {
        let data = []
        if (isFullProfile) {
            data = await user_profiles.find(payload)

        } else {
            if (payload)
                payload = hasMoreKeyValues(payload) ? payload : createQuery(payload);
            data = await user_profiles.find(payload).limit(req.body.filters.limit).skip(req.body.filters.skip)
                .select('name birth.dob marital_status professional.education astro.rasi astro.nakshatram professional.job professional.location email profile_img');

            totalRec = await user_profiles.countDocuments(payload);
        }

        if (!data.length) {
            const httpError = new HttpError("No data found", 204)
            return next(httpError);
        }
        res.status(200).json({ data, totalRec })

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
        // let profileToUpdate = data[0]; // Assuming you want to update the first matching profile
        const jsonString = JSON.stringify(req.body); // Assuming you want to update the first matching profile
        const profile = nestFields(JSON.parse(jsonString))
        profileToUpdate = {
            ...data[0]._doc,
            ...profile
        }
        // Update the profile with new profile_img paths

        delete profileToUpdate.__v
        const updatedProfile = await user_profiles.findOneAndUpdate(
            { email: req.body.email },
            { $set: profileToUpdate },
            { new: true } // Return the updated document
        );
        res.status(200).json({ data: updatedProfile });
        res.status(500)
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