var express = require('express');
var router = express.Router();
const csl = require('@emurgo/cardano-serialization-lib-nodejs');

const cbor = require('cbor');
const jsonToCbor = (obj) => {
    const hex_regex = /^[0-9A-Fa-f]+$/g;

    switch (typeof obj) {
        case "object":
            if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; i++) {
                    obj[i] = jsonToCbor(obj[i]);
                }
                return obj;
            } else if (Buffer.isBuffer(obj)) {
                return obj;
            } else {
                const cborMap = new cbor.Map();
                for (const [key, value] of Object.entries(obj)) {
                    const intKey = parseInt(key);
                    cborMap.set(intKey, jsonToCbor(value));
                }
                return cborMap;
            }
        default:
            if (obj.match !== undefined) {
                return obj.match(hex_regex) ? Buffer.from(obj, 'hex') : obj;
            }
            return obj;
    }
}

/**
* @swagger
* /verify_cip88_certificate:
*   post:
*     summary: Performs verification checks on CIP 88 certificate payload and witness information
*     tags: 
*       - verification
*     description: Performs verification checks on CIP 88 certificate payload and witness information
*     requestBody:
*       description: Parameters to the post request
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               payload:
*                 type: object
*               witnesses:
*                 type: array
*                 items:
*                   type: array
*                   items:
*                     type: string
*     responses:
*       200:
*         description: Successful
*         content: 
*           application/json: 
*             schema:
*               type: object
*               properties:
*                 policyIdMatch: 
*                   type: boolean
*                 witnessValidation: 
*                   type: object
*/

router.post('/', function (req, res, next) {

  const payload = req.body.payload;
  const scope = payload['1'];
  const policyId = scope['1'];
  var policyScript;
  if(Array.isArray(scope['2'])) {
    policyScript = scope['2'].join('');
  } 
  else {
    policyScript = scope['2'];
  }

  const witnesses = req.body.witnesses;

  const nativeScript = csl.NativeScript.from_hex(policyScript);

  const signers = nativeScript.get_required_signers().to_js_value();
  
  const payloadCbor = jsonToCbor(payload);
  const payloadData = cbor.encode(payloadCbor);
  
  var witness, signature, witnessKey, witnessKeyHash, witnessSignature, reportWitness;
  const witnessValidation = [];
  for (var i = 0; i < witnesses.length; i++) {
    reportWitness = {};
    witness = witnesses[i][0];
    try {
      witnessKey = csl.PublicKey.from_hex(witness);
      witnessKeyHash = witnessKey.hash().to_hex();
    }
    catch(err) {
      console.error(err);
      witnessKey, witnessKeyHash = null;
    }

    if(witnessKey == null || witnessKeyHash == null) continue;
    
    reportWitness['certificateKey'] = witness;
    reportWitness['publicKey'] = witnessKey.to_bech32();
    reportWitness['publicKeyHash'] = witnessKeyHash;

    if (signers.includes(witnessKeyHash)) {
      reportWitness['requiredSigner'] = true;
    }
    else {
      reportWitness['requiredSigner'] = false;
    }

    signature = witnesses[i][1];
    
    if (Array.isArray(signature)) signature = signature.join('');

    try {
      witnessSignature = csl.Ed25519Signature.from_hex(signature);
    }
    catch(err) {
      console.error(err);
      witnessSignature = null;
    }

    if(witnessSignature == null) continue;

    reportWitness['witnessSignature'] = witnessSignature.to_hex();

    if (witnessKey.verify(payloadData, witnessSignature)) {
      reportWitness['witnessSignatureValid'] = true;
    }
    else {
      reportWitness['witnessSignatureValid'] = false;
    }
    witnessValidation.push(reportWitness);
  }

  const scriptPolicyId = nativeScript.hash().to_hex();
  const policyIdMatch = scriptPolicyId == policyId;

  res.json({
    policyIdMatch: policyIdMatch,
    witnessValidation: witnessValidation
  });
});

module.exports = router;
