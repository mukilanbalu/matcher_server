const { subDays, format } = require('date-fns');

function getDateNDaysAgo(n) {
    const currentDate = new Date();
    const targetDate = subDays(currentDate, n);
    // Format the targetDate in dd-mm-yyyy format
    const prevFormattedDate = format(targetDate, 'dd/MM/yyyy');
    // const currprevFormattedDate = format(currentDate, 'dd/MM/yyyy');

    return prevFormattedDate;
}

module.exports = getDateNDaysAgo;