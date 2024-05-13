var express = require('express');
var router = express.Router();
var XMLHttpRequest = require('xhr2');

router.get('/', function (req, res, next) {

    const app = req.app;
    const scan_api_url = app.get('scan_api_url');
    const scan_api_key = process.env.SCAN_API_KEY;
    
    const fingerprint = req.query._fingerprint;
    
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
            res.json(JSON.parse(xhr.responseText));
        }
        else {
            res.json({});
        }
    }

    const scanquery = `${scan_api_url}/asset?fingerprint=${fingerprint}`;
    xhr.open('GET', scanquery, true);
    xhr.setRequestHeader('accept', 'application/json');
    xhr.setRequestHeader('apiKey', scan_api_key);
    xhr.send();

});

module.exports = router;