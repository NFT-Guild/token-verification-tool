var express = require('express');
var router = express.Router();
const cip88DbCommons = require('../../../resources/javascript/cip88_db_commons.js');
var XMLHttpRequest = require('xhr2');

/**
* @swagger
* /get_cip88_certificate?policy_id={policy_id}:
*   get:
*     summary: Returns the CIP 88 certificate with highest nonce for the given policy id, or null if none was found
*     tags: 
*       - verification
*     description: This function returns the CIP 88 certificate with highest nonce for the given policy id, or null if none was found
*     parameters:
*       - in: query
*         name: policy_id
*         schema:  
*           type: string
*     responses:
*       200:
*         description: Successful
*         content: 
*           application/json: 
*             schema:
*               type: object
*               properties:
*                 cip88_metadata: 
*                   type: object
*                   properties:
*                     0:
*                       type: integer
*                     1:
*                       type: object
*                     2:
*                       type: array
*                       items:
*                           type: array
*                           items:
*                               type: string
*
* /get_cip88_certificate?fingerprint={fingerprint}:
*   get:
*     summary: Returns the CIP 88 certificate with highest nonce for the given fingerprint, or null if none was found
*     tags: 
*       - verification
*     description: This function returns the CIP 88 certificate with highest nonce for the given policy id, or null if none was found
*     parameters:
*       - in: query
*         name: fingerprint
*         schema:
*           type: string
*     responses:
*       200:
*         description: Successful
*         content: 
*           application/json: 
*             schema:
*               type: object
*               properties:
*                 cip88_metadata: 
*                   type: object
*                   properties:
*                     0:
*                       type: integer
*                     1:
*                       type: object
*                     2:
*                       type: array
*                       items:
*                           type: array
*                           items:
*                               type: string
*/
router.get('/', async function (req, res, next) {

    const app = req.app;
    const scan_api_url = app.get('scan_api_url');
    const scan_api_key = process.env.SCAN_API_KEY;
    
    var policy_id = req.query.policy_id;
    const fingerprint = req.query.fingerprint;

    if (policy_id == null) {

        var xhrTxs = new XMLHttpRequest();
        xhrTxs.onload = async function () {

            if (xhrTxs.status === 200) {

                const assetInfo = JSON.parse(xhrTxs.responseText);
                if (!assetInfo.hasOwnProperty('policyId')) {
                    res.json({ "cip88_metadata": null });
                }
                policy_id = assetInfo.policyId;
                
                // get cip88 data for policy
                cip88DbCommons.getCertificateFromDb(policy_id, async (policy_id_db, cip88Info) => {

                    if (policy_id != policy_id_db) {
                        console.error('cip88 info returned wrong policy id');
                        res.json({ "cip88_metadata": null })
                    }
                    else if (cip88Info == null) {
                        console.error(`No cip88 info found for policy id ${policy_id}`);
                        res.json({ "cip88_metadata": null })
                    }
                    else {
                        res.json({ "cip88_metadata": cip88Info.metadata });
                    }

                });

            }
            else {
                console.error('api request failed');
                res.json({ "cip88_metadata": null });
            }
        };

        const scanquery = `${scan_api_url}/asset?fingerprint=${fingerprint}`;
        xhrTxs.open('GET', scanquery, true);
        xhrTxs.setRequestHeader('accept', 'application/json');
        xhrTxs.setRequestHeader('apiKey', scan_api_key);
        xhrTxs.send();
    }
    else {
        // get cip88 data for policy
        cip88DbCommons.getCertificateFromDb(policy_id, async (policy_id_db, cip88Info) => {

            if (policy_id != policy_id_db) {
                console.error('cip88 info returned wrong policy id');
                res.json({ "cip88_metadata": null })
            }
            else if (cip88Info == null) {
                console.error(`No cip88 info found for policy id ${policy_id}`);
                res.json({ "cip88_metadata": null })
            }
            else {
                res.json({ "cip88_metadata": cip88Info.metadata });
            }

        });
    }

});

module.exports = router;