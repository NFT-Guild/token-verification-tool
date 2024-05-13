var express = require('express');
var router = express.Router();
var XMLHttpRequest = require('xhr2');
const helpers = require("../../public/javascripts/helpers.js");

/**
* @swagger
* /check_cip27_compliance:
*   post:
*     summary: Returns a CIP 27 compliance report for the token policy
*     tags: 
*       - verification
*     description: Returns a CIP 27 compliance report for the token policy
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
*     responses:
*       200:
*         description: Successful
*         content: 
*           application/json: 
*             schema:
*               type: object
*               properties:
*                 errors:
*                   type: array
*                   items:
*                     type: string
*                 metadata:
*                   type: object
*/

router.post('/', function (req, res, next) {
    
    const policy_id = req.body.policy_id;
    const asset_list = [];
    const complianceReports = {};
    var asset_name;
    
    asset_list.push([policy_id, ""]);
    
    const xhr = new XMLHttpRequest();

    const koiosparams = `{"_asset_list":${JSON.stringify(asset_list)}}`;

    const koios_api_url = req.app.get('koios_api_url');

    // https://api.koios.rest/#post-/asset_info
    xhr.open('POST', `${koios_api_url}/asset_info`, true);

    xhr.onload = function () {
        assetInfo = JSON.parse(xhr.response);

        if(assetInfo.length > 0) {
            // at least one royalty token was found. Report using the first one 
            res.json(helpers.cip27Compliance(assetInfo[0]));
        }
        else {
            // no royalty token exists for this project
            const errors = ["No CIP 27 metadata specified"];
            res.json({ errors: errors, metadata: null });
        }
    }

    xhr.setRequestHeader('accept', 'application/json');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(koiosparams);
});

module.exports = router;