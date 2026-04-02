const supabase = require("../config/supabaseClient");
const HttpError = require("../models/httpError");

const sendInterest = async (req, res, next) => {
    const { receiver_email } = req.body;
    const sender_id = req.auth.sub;

    try {
        const { data: userData } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', receiver_email)
            .single();

        if (!userData) return next(new HttpError("Receiver not found", 404));

        const { data, error } = await supabase
            .from('interests')
            .insert([{ sender_id, receiver_id: userData.id, status: 'pending' }])
            .select();

        if (error) throw error;
        res.status(201).json({ data: data[0] });
    } catch (err) { next(err); }
};

const getInterests = async (req, res, next) => {
    const user_id = req.auth.sub;
    try {
        let query = supabase.from('interests').select(`
            *,
            sender:profiles!interests_sender_id_fkey(name, profile_img, email),
            partner_profile:profiles!interests_receiver_id_fkey(name, profile_img, email)
        `);

        const { data, error } = await query;
        if (error) throw error;

        const enrichedData = data.filter(i => i.sender_id === user_id || i.receiver_id === user_id).map(i => {
            const isSender = i.sender_id === user_id;
            return {
                ...i,
                partner_profile: isSender ? i.partner_profile : i.sender,
                sender_email: i.sender?.email,
                receiver_email: i.partner_profile?.email
            };
        });
        
        res.status(200).json({ data: enrichedData });
    } catch (err) { next(err); }
};

const toggleInterest = async (req, res, next) => {
    const { receiver_email } = req.body;
    const sender_id = req.auth.sub;

    try {
        const { data: userData } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', receiver_email)
            .single();

        if (!userData) return next(new HttpError("Receiver not found", 404));

        const { data: existingInterest } = await supabase
            .from('interests')
            .select('*')
            .eq('sender_id', sender_id)
            .eq('receiver_id', userData.id)
            .single();

        if (existingInterest) {
            const { error: deleteError } = await supabase
                .from('interests')
                .delete()
                .eq('id', existingInterest.id);

            if (deleteError) throw deleteError;
            return res.status(200).json({ message: "Interest removed", action: "removed" });
        } else {
            const { data, error } = await supabase
                .from('interests')
                .insert([{ 
                    sender_id, 
                    receiver_id: userData.id, 
                    status: 'pending' 
                }])
                .select();

            if (error) throw error;
            res.status(201).json({ message: "Interest added", action: "added", data: data[0] });
        }
    } catch (err) { next(err); }
};

const checkInterestStatus = async (req, res, next) => {
    const { receiver_email } = req.query;
    const sender_id = req.auth.sub;

    try {
        const { data: userData } = await supabase.from('profiles').select('id').eq('email', receiver_email).single();
        if (!userData) return res.status(200).json({ hasSentInterest: false });

        const { data } = await supabase
            .from('interests')
            .select('*')
            .eq('sender_id', sender_id)
            .eq('receiver_id', userData.id)
            .single();

        res.status(200).json({ hasSentInterest: !!data, interest: data });
    } catch (err) { next(err); }
};

exports.sendInterest = sendInterest;
exports.getInterests = getInterests;
exports.toggleInterest = toggleInterest;
exports.checkInterestStatus = checkInterestStatus;
exports.updateInterestStatus = async (req, res, next) => { 
    const { interest_id, status } = req.body; 
    try { 
        const { data, error } = await supabase.from('interests').update({ status }).eq('id', interest_id).select(); 
        if(error) throw error; 
        res.status(200).json({ data: data[0] }); 
    } catch(err) { next(err); } 
};
