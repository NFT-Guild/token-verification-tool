import {
    fromText,
    toLabel,
    fromLabel
} from "https://unpkg.com/lucid-cardano@0.10.7/web/mod.js";
import * as cbor from "https://deno.land/x/cbor@v1.5.8/index.js";

const hex_var_char = '^[0-9a-fA-F]+$';

const cip68RefTokenLabel    = toLabel(100); // NFT - Reference NFT locked at a script containing the datum
const cip68UserTokenLabels  = [
    toLabel(222), // NFT - NFT held by the user's wallet making use of CIP-0025 inner structure
    toLabel(333), // FT  - FT held by the user's wallet making use of Cardano foundation off-chain registry inner structure
    toLabel(444)  // RFT - RFT held by the user's wallet making use of the union of CIP-0025 inner structure AND the Cardano foundation off-chain registry inner structure
]; 

function decodeCBOR(encodedCBOR) {
    return cbor.decode(encodedCBOR);
}

function encodeDataToCBOR(data) {
    return cbor.encode(data);
}

function checkHexAndHash(valueToCheck) {
    var tmp = valueToCheck;
    if (valueToCheck.indexOf('0x') == 0) {
        tmp = valueToCheck.substring(2)
    }

    var hash_test = tmp.match(hex_var_char);
    if (hash_test === null) {
        tmp = fromText(tmp);
    } 

    return tmp;
}

async function getAssetInfo(assetinfo_field_prefix, alsoFetchRoyaltyToken) {

    const assetInfoFields = document.querySelectorAll(`[id^="${assetinfo_field_prefix}"]`);
            
    const asset_list = [];
  
    var assetName, assetNameHex, label, policyid, item;
    for(var j = 0; j < assetInfoFields.length; j++) {
        item = assetInfoFields[j];
        assetName = document.getElementById(item.id).value.trim();
        if(assetName == "") continue;

        if(assetName.indexOf('asset1') == 0) {
            // this is a fingerprint. Fetch policy id and asset name for this asset
            const response = await fetch(`/api_asset_by_fingerprint?_fingerprint=${assetName}`);
            const assetInfo = await response.json();
            if(!assetInfo.hasOwnProperty('policyId') || !assetInfo.hasOwnProperty('assetName')) { 
                // no valid asset was found
                continue;
            }

            policyid = assetInfo.policyId;
            assetNameHex = assetInfo.assetName;
        }
        else {
            if(assetName.length <= 56) { 
                // asset id is not long enough to be valid
                continue; 
            }

            // split hash into policy id and asset name
            policyid = assetName.substring(0,56);
            assetNameHex = assetName.substring(56);
        }

        asset_list.push([policyid, assetNameHex]);

        // Fetch ref token if the current token is a CIP 68 token
        for(var i = 0; i < cip68UserTokenLabels.length; i++) {
            label = cip68UserTokenLabels[i];
            if(assetNameHex.startsWith(label)) {
                // this is a cip68 user token. Add ref token to asset list to fetch
                asset_list.push([policyid, assetNameHex.replace(label, cip68RefTokenLabel)]);
                break;
            }
        }
    }

    if(alsoFetchRoyaltyToken) {
        // the royalty token is a nameless token minted on the same policy
        asset_list.push([policyid, '']);
    }

    const koiosResponse = await fetch(`/api_asset_info`, {
        method: "POST", 
        mode: "cors", 
        cache: "no-cache", 
        credentials: "same-origin", 
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        redirect: "follow", 
        referrerPolicy: "no-referrer", 
        body: `{"asset_list":${JSON.stringify(asset_list)}}`
    });

    const assetKoiosData = await koiosResponse.json();

    const cip88Response = await fetch(`/get_cip88_certificate?policy_id=${policyid}`);
    const cip88Data = await cip88Response.json();
    
    const cip88Metadata = cip88Data['cip88_metadata'];

    // set cip 88 metadata in all assets returned from Koios API
    assetKoiosData.map((asset) => {
        asset['cip88_metadata'] = cip88Metadata;
    })

    return assetKoiosData;
}

function cip68TokenTypeFromLabel(label) {
    return fromLabel(label);
}


async function hashData(data) {
    return fromText(JSON.stringify(data))
}

window.getAssetInfo = getAssetInfo;
window.hashData = hashData;
window.cip68RefTokenLabel = cip68RefTokenLabel;
window.cip68UserTokenLabels = cip68UserTokenLabels;
window.cip68TokenTypeFromLabel = cip68TokenTypeFromLabel;
window.hex_var_char = hex_var_char;
window.decodeCBOR = decodeCBOR;
window.encodeDataToCBOR = encodeDataToCBOR;


