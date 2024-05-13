
const schedule = require('node-schedule');
var XMLHttpRequest = require('xhr2');
const cip88 = require("../../../resources/javascript/cip88.js");
const cip88DbCommons = require("../../../resources/javascript/cip88_db_commons.js");
const helpers = require("../../public/javascripts/helpers.js")

const kupo_api_url = 'http://127.0.0.1:1442';

// This is a beta version of the sync. Still some issues to make it behave perfectly, but is good enough to start using

const job = schedule.scheduleJob('*/1 * * * *', () => {
    console.log('Running cip 88 certificate sync job');

    // cip88DbCommons.removeCIP88CertificatesTable();
    // cip88DbCommons.createCIP88CertificatesTable();
    
    readNewCertificatesFromChain();

    // cip88DbCommons.getNLastCertsFromDb(100, (certificates) => {
    //     certificates.forEach((cert) => {
    //         console.log(JSON.stringify(cert));
    //     });
    // });
    
});

function inspectCIP88Cert(policy_id, cip88Info) {
    if(cip88Info == null) { console.log(`cip88Info not found for ${policy_id}`); return; }

    if(cip88Info.policy_id != policy_id) {
        console.error(`cip88 info returned is not the correct policy_id`);
        return;
    }
    
    if(!helpers.isObject(cip88Info.metadata)) {
        console.error(`cip88 info contains no metadata of type object`);
        return;
    }
    
    if(!cip88.isValidCIP88Certificate(cip88Info.metadata)) {
        console.error(`cip 88 certificate for ${policy_id} is invalid`)
        return;
    }
}

function processCIP88Metadata(slot, txid, metadata) {
    const metadataDecoded = helpers.decodeObject(metadata['867'].map);
    
    // validate that this certificate is valid by inspecting the public keys and signatures
    if (cip88.isValidCIP88Certificate(metadataDecoded)) {
        // all checks successful. Insert certificate in database
        cip88DbCommons.addCertificateToDb(slot, txid, metadataDecoded);
    }
    else {
        // Do we insert invalid certificates in the database? 
        // Currently 'isValidCIP88Certificate' function allows all to pass
        console.log('invalid certificate ' + JSON.stringify(metadataDecoded));
    }
}

async function readNewCertificatesFromChain() {

    cip88DbCommons.getSlotOfLastCert((slot) => {

        created_after = slot + 1;
        
        var xhrTxs = new XMLHttpRequest();
        xhrTxs.onload = async function () {

            if (xhrTxs.status === 200) {

                const cip88MetadataList = JSON.parse(xhrTxs.responseText);

                // extract values
                var tx;
                for (var i = 0; i < cip88MetadataList.length && i < 100; i++) {
                    // processing max 100 certificates per sync session
                    tx = cip88MetadataList[i]
                    if (tx != null) {
                        getMetadata(tx.created_at.slot_no, tx.transaction_id, processCIP88Metadata);
                    }
                }
            }
            else {
                console.error('xhr request unsuccessful');
            }
        };

        const kupoquery = `${kupo_api_url}/matches${created_after > 0 ? `?created_after=${created_after}` : ''}`;
        xhrTxs.open('GET', kupoquery, true);
        xhrTxs.setRequestHeader('accept', 'application/json');
        xhrTxs.send();
    });
}

async function getMetadata(slot, txid, callback) {
    
    var xhrTxs2 = new XMLHttpRequest();
    xhrTxs2.onload = function () {

        if (xhrTxs2.status === 200) {
            const metadata = JSON.parse(xhrTxs2.responseText)[0].schema;
            callback(slot, txid, metadata);
        }
    };
    const kupoquery = `${kupo_api_url}/metadata/${slot}?transaction_id=${txid}`;
    xhrTxs2.open('GET', kupoquery, true);
    xhrTxs2.setRequestHeader('accept', 'application/json');
    xhrTxs2.send();
}
