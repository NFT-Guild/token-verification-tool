import {
    Blockfrost,
    Lucid,
    Data,
    applyParamsToScript,
    fromText,
    toLabel,
    Constr,
    Utils
} from "https://unpkg.com/lucid-cardano@0.10.7/web/mod.js";
import * as cbor from "https://deno.land/x/cbor@v1.5.8/index.js";

var mintingStandard = '';

// KOIOS MAINNET / PREPROD SETTING - CHANGE TO YOUR DESIRED ENVIRONMENT
//const koios_api_url = 'https://api.koios.rest/api/v0'; // mainnet
const koios_api_url = 'https://preprod.koios.rest/api/v1'; // preproduction

// BLOCKFROST MAINNET / PREPROD SETTING - CHANGE TO YOUR DESIRED ENVIRONMENT
//cost blockfrost_api_url = 'https://cardano-mainnet.blockfrost.io/api/v0'; // mainnet
const blockfrost_api_url = 'https://cardano-preprod.blockfrost.io/api/v0'; // preproduction

// consider to reengineer so blockfrost_api_key is invisible, if you experience miss-use
const blockfrost_api_key = 'preprodEjFneFL6OYHnNmdWLCSKYvlm73cGm90a'; // Example only: register with blockfrost and create your own project id
//const blockfrost_api_env = 'Mainnet'; // mainnet
const blockfrost_api_env = 'Preprod'; // preproduction

async function getAssetInfo(policyid, asciiname, elemid) {
    
    const hexName = fromText(asciiname);

    const response = await fetch(`/api_asset_info`, {
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
        body: `{"asset_policyid":"${policyid}", "asset_name":"${hexName}"}`, // body data type must match "Content-Type" header
    });

    const jsonData = await response.json();
    
    document.getElementById(elemid).innerText = JSON.stringify(jsonData);

}


window.getAssetInfo = getAssetInfo;



