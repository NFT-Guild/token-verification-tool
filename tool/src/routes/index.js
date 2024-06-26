var express = require('express');
var router = express.Router();

function getCookie(cookieString, cookiename) {

    if(cookieString == null) {
        // no cookie currently set
        return '';
    }

    const indexStart = cookieString.indexOf(cookiename);
    if (indexStart == -1) {
        // no cookie found with that name
        return '';
    }
    else {
        // cookie found..check value
        const indexEnd = cookieString.indexOf(';',indexStart);
        var cookieValue;
        if(indexEnd == -1) {
            cookieValue = cookieString.substring(indexStart);
        }
        else {
            cookieValue = cookieString.substring(indexStart, indexEnd);
        }

        cookieValue = cookieValue.substring(cookieValue.indexOf('=') + 1);

        
        return cookieValue;
    }
}

router.get('/', function (req, res, next) {
    const app = req.app;

    // cookie start
    const themeCookie = getCookie(req.headers.cookie, 'verification_tool_theme');
    var theme;
    if(themeCookie == '') {
        // no cookie set in users browser cookies...use server theme
        theme = app.get(`verification_tool_theme`);   
    }
    else {
        // user browser cookie set. Use this
        theme = themeCookie;
    }
    
    res.cookie('verification_tool_theme', theme);
    if (theme != 'light-mode') {
        theme = 'dark-mode';
    }
    // cookie end

    res.render('index', {
        title: 'Token Verification Tool',
        navWebpage: app.get('navWebpage'),
        navTwitter: app.get('navTwitter'),
        navDiscord: app.get('navDiscord'), 
        themeclass: theme
    });
});

module.exports = router;