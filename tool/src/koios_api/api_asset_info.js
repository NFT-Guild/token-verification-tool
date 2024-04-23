var express = require('express');
var router = express.Router();
var XMLHttpRequest = require('xhr2');

router.post('/', function (req, res, next) {
    
    const app = req.app;
    const koios_api_url = app.get('koios_api_url');
    
    const xhr = new XMLHttpRequest();
    const asset_list = req.body.asset_list;
    
    const koiosparams = `{"_asset_list":${JSON.stringify(asset_list)}}`;
    
    // https://api.koios.rest/#post-/asset_info
    xhr.open('POST', `${koios_api_url}/asset_info`, true);

    xhr.onload = function () {

        res.json(JSON.parse(xhr.response));
    }

    xhr.setRequestHeader('accept', 'application/json');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(koiosparams);
});

module.exports = router;