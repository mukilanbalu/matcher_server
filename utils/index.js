const { subDays, format } = require('date-fns');
const supabase = require('../config/supabaseClient');

function getDateNDaysAgo(n) {
    const currentDate = new Date();
    const targetDate = subDays(currentDate, n);
    // Format the targetDate in dd-mm-yyyy format
    const prevFormattedDate = format(targetDate, 'dd/MM/yyyy');
    // const currprevFormattedDate = format(currentDate, 'dd/MM/yyyy');

    return prevFormattedDate;
}

// Generate unique profile ID in format: ACC12345678 (like Tamil Matrimony/Shaadi)
// ACC = Anbupriyal Chettiar Community, followed by 8 digits
async function generateProfileId() {
    const prefix = 'ACC';
    let uniqueId = false;
    let profileId = '';

    while (!uniqueId) {
        // Generate random 8-digit number
        const randomNum = Math.floor(Math.random() * 90000000) + 10000000;
        profileId = `${prefix}${randomNum}`;

        // Check if this ID already exists in database (Supabase)
        const { data, error } = await supabase
            .from('profiles')
            .select('profile_id')
            .eq('profile_id', profileId)
            .single();

        if (!data && (!error || error.code === 'PGRST116')) {
            uniqueId = true;
        }
    }

    return profileId;
}

module.exports = {
    getDateNDaysAgo,
    generateProfileId
};