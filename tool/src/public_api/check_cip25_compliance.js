var express = require('express');
var router = express.Router();
var XMLHttpRequest = require('xhr2');
const helpers = require("../../public/javascripts/helpers.js");

/**
* @swagger
* /check_cip25_compliance:
*   post:
*     summary: Returns a CIP 25 compliance report for the token
*     tags: 
*       - verification
*     description: Returns a CIP 25 compliance report for the token
*     requestBody:
*       description: Parameters to the post request
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               policy_id:
*                 type: string
*               asset_names:
*                 type: array
*                 items:
*                   type: string
*     responses:
*       200:
*         description: Successful
*         content: 
*           application/json: 
*             schema:
*               type: object
*               maxProperties: 1
*               additionalProperties:
*                     type: object
*                     minProperties: 1
*                     additionalProperties:
*                       type: object
*                       properties:
*                         errors:
*                           type: array
*                           items:
*                               type: string
*                         metadata:
*                           type: object
*/

router.post('/', function (req, res, next) {
    
    const policy_id = req.body.policy_id;
    const asset_names = req.body.asset_names;
    const asset_list = [];
    const complianceReports = {};
    var asset_name;
    for(var i = 0; i < asset_names.length; i++) {
        asset_name = asset_names[i]
        if(!helpers.isHex(asset_name)) {
            asset_name = Buffer.from(asset_name).toString('hex');
        }
        asset_list.push([policy_id, asset_name]);
    }
    
    const xhr = new XMLHttpRequest();

    const koiosparams = `{"_asset_list":${JSON.stringify(asset_list)}}`;

    const koios_api_url = req.app.get('koios_api_url');

    // https://api.koios.rest/#post-/asset_info
    xhr.open('POST', `${koios_api_url}/asset_info`, true);

    xhr.onload = function () {
        assetInfo = JSON.parse(xhr.response);
        
        if(assetInfo.length > 0) {
            complianceReports[`${policy_id}`] = {};
            const tokenPolicy = complianceReports[`${policy_id}`];
            for(var i = 0; i < assetInfo.length; i++) {
                tokenPolicy[`${assetInfo[i].asset_name}`] = helpers.cip25Compliance(assetInfo[i]);
            }
        }
        
        res.json(complianceReports);
    }

    xhr.setRequestHeader('accept', 'application/json');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(koiosparams);
});

module.exports = router;