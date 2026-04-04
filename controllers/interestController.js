const supabase = require("../config/supabaseClient");
const HttpError = require("../models/httpError");

const sendInterest = async (req, res, next) => {
    const { receiver_email } = req.body;
    const sender_id = req.auth?.sub || req.auth?.payload?.sub;

    try {
        const { data: userData } = await supabase
            .from('profiles')
            .select('auth_id')
            .eq('email', receiver_email)
            .single();

        if (!userData) return next(new HttpError("Receiver not found", 404));

        const { data, error } = await supabase
            .from('interests')
            .insert([{ sender_id, receiver_id: userData.auth_id, status: 'pending' }])
            .select();

        if (error) throw error;
        res.status(201).json({ data: data[0] });
    } catch (err) { next(err); }
};

const getInterests = async (req, res, next) => {
    const user_id = req.auth?.sub || req.auth?.payload?.sub;
    try {
        const { data, error } = await supabase
            .from('interests')
            .select('*')
            .or(`sender_id.eq."${user_id}",receiver_id.eq."${user_id}"`);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(200).json({ sent: [], received: [] });
        }

        const authIds = new Set();
        data.forEach(i => {
           authIds.add(i.sender_id);
           authIds.add(i.receiver_id);
        });

        const { data: profiles, error: profileErr } = await supabase
            .from('profiles')
            .select('auth_id, name, profile_img, email')
            .in('auth_id', Array.from(authIds));

        if (profileErr) throw profileErr;

        const profileMap = {};
        profiles.forEach(p => { profileMap[p.auth_id] = p; });

        const sent = [];
        const received = [];

        data.forEach(i => {
            const isSender = i.sender_id === user_id;
            const senderProfile = profileMap[i.sender_id] || {};
            const receiverProfile = profileMap[i.receiver_id] || {};
            
            const item = {
                ...i,
                sender: senderProfile,
                partner_profile: isSender ? receiverProfile : senderProfile,
            };
            
            if (isSender) {
                sent.push(item);
            } else if (i.receiver_id === user_id) {
                received.push(item);
            }
        });
        
        res.status(200).json({ sent, received });
    } catch (err) { next(err); }
};

const toggleInterest = async (req, res, next) => {
    const { receiver_email } = req.body;
    const sender_id = req.auth?.sub || req.auth?.payload?.sub;

    try {
        // Check if the sender has a profile using auth_id
        const { data: senderProfile } = await supabase
            .from('profiles')
            .select('auth_id')
            .eq('auth_id', sender_id)
            .single();

        if (!senderProfile) return next(new HttpError("You must create your profile before expressing interest.", 403));

        // Get receiver auth_id
        const { data: userData } = await supabase
            .from('profiles')
            .select('auth_id')
            .eq('email', receiver_email)
            .single();

        if (!userData) return next(new HttpError("Receiver not found", 404));

        // Check for existing interest using auth_ids
        const { data: existingInterest } = await supabase
            .from('interests')
            .select('*')
            .eq('sender_id', sender_id)
            .eq('receiver_id', userData.auth_id)
            .maybeSingle();

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
                    receiver_id: userData.auth_id, 
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
    const sender_id = req.auth?.sub || req.auth?.payload?.sub;

    try {
        const { data: userData } = await supabase.from('profiles').select('auth_id').eq('email', receiver_email).single();
        if (!userData) return res.status(200).json({ hasSentInterest: false });

        const { data } = await supabase
            .from('interests')
            .select('*')
            .eq('sender_id', sender_id)
            .eq('receiver_id', userData.auth_id)
            .maybeSingle();

        res.status(200).json({ hasSentInterest: !!data, interest: data });
    } catch (err) { next(err); }
};

const updateInterestStatus = async (req, res, next) => { 
    const { interest_id, status } = req.body; 
    try { 
        const { data, error } = await supabase.from('interests').update({ status }).eq('id', interest_id).select(); 
        if(error) throw error; 
        res.status(200).json({ data: data[0] }); 
    } catch(err) { next(err); } 
};

exports.sendInterest = sendInterest;
exports.getInterests = getInterests;
exports.toggleInterest = toggleInterest;
exports.checkInterestStatus = checkInterestStatus;
exports.updateInterestStatus = updateInterestStatus;
