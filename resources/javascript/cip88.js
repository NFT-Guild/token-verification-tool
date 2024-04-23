const helpers = require("../../tool/public/javascripts/helpers.js");

function getCIP88PolicyId(metadata) {
    const registrationPayload = metadata['1'];
    const scope = registrationPayload['1'];
    if(!Array.isArray(scope)) {
        console.error('scope is not array');
        return "";
    }

    // scope is an array
    
    var policy_id = scope[1];
    if(Array.isArray(policy_id)) {
        policy_id = policy_id[0];
    }
    
    if(!helpers.isHex(policy_id,56)) return "";

    // policy id found
    return policy_id;
}

function getCIP88Nonce(metadata) {
    const registrationPayload = metadata['1'];
    const nonce = registrationPayload['4'];

    if(isNaN(nonce)) return -1;

    // nonce is a number
    return nonce;
}

function isValidCIP88Certificate(cip88metadata) {

    // TODO: For now left empty as it is unclear if this is strictly needed

    // validate script and policy_id

    // validate public key is contained in script

    // validate the signature is valid for the public key and metadata content

    return true;
}

module.exports = {
    getCIP88Nonce: getCIP88Nonce,
    getCIP88PolicyId: getCIP88PolicyId,
    isValidCIP88Certificate: isValidCIP88Certificate
};