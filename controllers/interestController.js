const supabase = require("../config/supabaseClient");
const HttpError = require("../models/httpError");

const sendInterest = async (req, res, next) => {
    const { receiver_email } = req.body;
    const sender_id = req.auth.sub;

    try {
        // Get receiver_id from email
        const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', receiver_email)
            .single();

        if (userError || !userData) {
            return next(new HttpError("Receiver not found", 404));
        }

        const { data, error } = await supabase
            .from('interests')
            .insert([{ sender_id, receiver_id: userData.id, status: 'pending' }])
            .select();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return next(new HttpError("Interest already sent", 400));
            }
            throw error;
        }

        res.status(201).json({ message: "Interest sent successfully", data: data[0] });
    } catch (err) {
        next(err);
    }
};

const getInterests = async (req, res, next) => {
    const user_id = req.auth.sub;
    const { type } = req.query; // 'sent' or 'received'

    try {
        let query = supabase.from('interests').select(`
            *,
            sender:profiles!interests_sender_id_fkey(name, profile_img),
            partner_profile:profiles!interests_receiver_id_fkey(name, profile_img)
        `);

        if (type === 'sent') {
            query = query.eq('sender_id', user_id);
        } else if (type === 'received') {
            query = query.eq('receiver_id', user_id);
            // Overwrite partner_profile to be the sender for received interests
            const { data, error } = await query;
            if (error) throw error;
            const enrichedData = data.map(i => ({
                ...i,
                partner_profile: i.sender
            }));
            return res.status(200).json({ data: enrichedData });
        } else {
            query = query.or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        res.status(200).json({ data });
    } catch (err) {
        next(err);
    }
};

const updateInterestStatus = async (req, res, next) => {
    const { interest_id, status } = req.body;
    const user_id = req.auth.sub;

    try {
        const { data, error } = await supabase
            .from('interests')
            .update({ status })
            .eq('id', interest_id)
            .eq('receiver_id', user_id) // Only receiver can update status
            .select();

        if (error) throw error;
        if (!data.length) {
            return next(new HttpError("Interest not found or unauthorized", 404));
        }

        res.status(200).json({ message: `Interest ${status}`, data: data[0] });
    } catch (err) {
        next(err);
    }
};

exports.sendInterest = sendInterest;
exports.getInterests = getInterests;
exports.updateInterestStatus = updateInterestStatus;
