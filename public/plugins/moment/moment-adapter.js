define('momentadapter', ['moment'], function(moment) {
    // Set the global.
    window.moment = moment;

    return moment;
});