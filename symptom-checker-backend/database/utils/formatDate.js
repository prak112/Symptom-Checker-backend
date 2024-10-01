/**
 * Formats an ISO date to a custom format.
 * 
 * @param {Date} dateString - The ISO date string to be formatted.
 * @returns {string} The formatted date string in the format 'YYYY-MM-DD HH:mm:ss'.
 */
function formatISODateToCustom(dateString) {
    const date = new Date(dateString);

    // Use Intl.DateTimeFormat to format the date and time with time zone
    const options = {
        year:'2-digit', 
        month:'2-digit', 
        day:'2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    const formatter = new Intl.DateTimeFormat('en-FI', options);
    const formattedDate = formatter.format(date);
    
    return formattedDate
}


module.exports = {
    formatISODateToCustom
}