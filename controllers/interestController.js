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
            sender:profiles!interests_sender_id_fkey(name, profile_img, email),
            partner_profile:profiles!interests_receiver_id_fkey(name, profile_img, email)
        `);

        if (type === 'sent') {
            query = query.eq('sender_id', user_id);
        } else if (type === 'received') {
            query = query.eq('receiver_id', user_id);
        } else {
            query = query.or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Enrich the data to ensure partner_profile correctly points to the 'other' person
        const enrichedData = data.map(i => {
            const isSender = i.sender_id === user_id;
            return {
                ...i,
                partner_profile: isSender ? i.partner_profile : i.sender,
                sender_email: i.sender?.email
            };
        });
        
        res.status(200).json({ data: enrichedData });
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

const toggleInterest = async (req, res, next) => {
    const { receiver_email } = req.body;
    const sender_id = req.auth.sub;

    try {
        // Check if interest already exists
        const { data: existingInterest, error: fetchError } = await supabase
            .from('interests')
            .select('*')
            .eq('sender_id', sender_id)
            .eq('receiver_email', receiver_email)
            .single();

        if (existingInterest) {
            // Remove interest (toggle off)
            const { error: deleteError } = await supabase
                .from('interests')
                .delete()
                .eq('id', existingInterest.id);

            if (deleteError) throw deleteError;
            return res.status(200).json({ message: "Interest removed", action: "removed" });
        } else {
            // Toggle on
            // Get sender email
            const { data: senderData } = await supabase.from('profiles').select('email').eq('id', sender_id).single();

            // Get receiver_id from email
            const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', receiver_email)
                .single();

            if (userError || !userData) {
                return next(new HttpError("Receiver not found", 404));
            }

            // Create new interest (toggle on)
            const { data, error } = await supabase
                .from('interests')
                .insert([{ 
                    sender_id, 
                    sender_email: senderData?.email,
                    receiver_id: userData.id, 
                    receiver_email, 
                    status: 'pending',
                    created_at: new Date()
                }])
                .select();

            if (error) {
                if (error.code === '23505') { // Unique violation
                    return res.status(200).json({ message: "Interest already exists" });
                }
                throw error;
            }

            res.status(201).json({ message: "Interest sent successfully", action: "added", data: data[0] });
        }
    } catch (err) {
        next(err);
    }
};

const checkInterestStatus = async (req, res, next) => {
    const { receiver_email } = req.query;
    const sender_id = req.auth.sub;

    try {
        const { data, error } = await supabase
            .from('interests')
            .select('*')
            .eq('sender_id', sender_id)
            .eq('receiver_email', receiver_email)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.status(200).json({ hasSentInterest: !!data, interest: data });
    } catch (err) {
        next(err);
    }
};

exports.sendInterest = sendInterest;
exports.getInterests = getInterests;
exports.updateInterestStatus = updateInterestStatus;
exports.toggleInterest = toggleInterest;
exports.checkInterestStatus = checkInterestStatus;
