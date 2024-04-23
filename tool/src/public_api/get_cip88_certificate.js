var express = require('express');
var router = express.Router();
const cip88DbCommons = require('../../../resources/javascript/cip88_db_commons.js');

/**
* @swagger
* /get_cip88_certificate:
*   post:
*     summary: Returns the CIP 88 certificate with highest nonce for the given policy id, or null if none was found
*     tags: 
*       - verification
*     description: This function returns the CIP 88 certificate with highest nonce for the given policy id, or null if none was found
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
router.post('/', function (req, res, next) {
    
    const policy_id = req.body.policy_id;
    
    // get cip88 data for policy
    cip88DbCommons.getCertificateFromDb(policy_id, (policy_id_db, cip88Info) => {

        if(policy_id != policy_id_db) {
            console.error('cip88 info returned wrong policy id');
            res.json({"cip88_metadata": null})
        }
        else if(cip88Info == null) {
            console.error(`No cip88 info found for policy id ${policy_id}`);
            res.json({"cip88_metadata": null})
        }
        else {
            res.json({"cip88_metadata": cip88Info.metadata});
        }
        
    });

});

module.exports = router;