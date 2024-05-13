var express = require('express');
var router = express.Router();
const helpers = require("../../public/javascripts/helpers.js");
const cip88DbCommons = require('../../../resources/javascript/cip88_db_commons.js');

/**
* @swagger
* /check_cip88_compliance:
*   post:
*     summary: Returns a CIP 88 compliance report for the token
*     tags: 
*       - verification
*     description: Returns a CIP 88 compliance report for the token
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
router.post('/', function (req, res, next) {
    
    const policy_id = req.body.policy_id;
    
    // get cip88 data for policy
    cip88DbCommons.getCertificateFromDb(policy_id, async (policy_id_db, cip88Info) => {

        if(policy_id != policy_id_db) {
            console.error('cip88 info returned wrong policy id');
            res.json({"cip88_metadata": null})
        }
        else if(cip88Info == null) {
            console.error(`No cip88 info found for policy id ${policy_id}`);
            res.json({"cip88_metadata": null})
        }
        else {
            const report = await helpers.cip88Compliance({"cip88_metadata": cip88Info.metadata});
            res.json(report);
        }
    });
});

module.exports = router;