import {
    Blockfrost,
    Lucid,
    Data,
    applyParamsToScript,
    fromText,
    fromHex,
    toHex,
    toLabel,
    toText,
    Constr,
    Utils
} from "https://unpkg.com/lucid-cardano@0.10.7/web/mod.js";
import * as cbor from "https://deno.land/x/cbor@v1.5.8/index.js";

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

const CIP88METADATALABEL = '867';

const validators = {
    'owner_can_mint_policy': {
        // unitialized...must be parameterized before use
        "type": "PlutusV2",
        "script": "58780100003232323232323223222533300633223322323300100100322533300f00114a026464a66601c66e3c00801452889980200200098090011bae301000137586018601a601a601a601a601a601a601a601a600e0040026014600a0020062930b1bae001230043754002ae6955ceaab9e5573eae855d101"
    },
    'public_micro_drive': {
        // unitialized...must be parameterized before use
        "type": "PlutusV2",
        "script": "5898010000323232323232322322225333007323253330093370e90010008991991199119198008008019129998098008a501323253330123371e00400a29444cc010010004c058008dd7180a0009bac301030113011301130113011301130113011300b002001300e3009004007300800214a060126ea8004c02cc030c01800452616375c002460086ea80055cd2ab9d5573caae7d5d0aba201"
    }
}

async function getPMDScript() {
    // builds a PMD (public micro drive) spending validator script for the connected wallet

    const lucid = await connectWalletToLucid();

    const bech32_addr = await lucid.wallet.address();

    const pkh = lucid.utils.getAddressDetails(bech32_addr).paymentCredential?.hash || "";

    var linkedPMDValidator; 
    
    // Initialize the PMD validator so it is linked to the connected wallet
    // Source code available in resources/validators/public_micro_drive.ak
    linkedPMDValidator = {
        type: "PlutusV2",
        script: applyParamsToScript(
            validators['public_micro_drive'].script,
            [pkh])
    };
    
    return linkedPMDValidator;
}

async function getOCMScript() {
    // builds a OCM (owner can mint) minting policy script for the connected wallet

    const lucid = await connectWalletToLucid();

    const bech32_addr = await lucid.wallet.address();

    const pkh = lucid.utils.getAddressDetails(bech32_addr).paymentCredential?.hash || "";

    var linkedPMDValidator; 
    
    // Initialize the OCM minting policy so it is linked to the connected wallet
    // Source code available in resources/validators/owner_can_mint_policy.ak
    linkedPMDValidator = {
        type: "PlutusV2",
        script: applyParamsToScript(
            validators['owner_can_mint_policy'].script,
            [pkh])
    };
    
    return linkedPMDValidator;
}

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

async function connectWalletToLucid() {
    const lucid = await Lucid.new(new Blockfrost(blockfrost_api_url, blockfrost_api_key), blockfrost_api_env);

    const api = await window.cardano.nami.enable();
    lucid.selectWallet(api);
    return lucid;
}

async function hashData(data) {
    console.log('hashData start ', data);

    const response = await fetch(`/api_hash_data`, {
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
        body: `{"data_to_hash":${JSON.stringify(data)}}`, // body data type must match "Content-Type" header
    });

    const jsonData = await response.json();
    return jsonData.datahash;
}

async function signData(dataHex) {
    
    const lucid = await connectWalletToLucid();

    const ownWalletAddress = await lucid.wallet.address();
    
    const message = await lucid.newMessage(ownWalletAddress, dataHex);
    const signedMessage = await message.sign();

    const pkh = await getConnectedPKH();
    
    const decodedKey = cbor.decode(fromHex(signedMessage.key));
    
    const decodedSignature = cbor.decode(fromHex(signedMessage.signature));
    
    var witness = [toHex(decodedKey['-2'])]
    // splitting the signature in (two) 64-byte chunks
    witness = witness.concat(toHex(decodedSignature[3]).match(/.{1,64}/g))
    var metadata = JSON.parse(JSON.stringify(CIP88METADATATEMPLATE));

    // setting updated witness in the token metadata
    metadata['2'] = [witness];

    // updating the metadata view
    document.getElementById('mintTokenMetadata').innerHTML = syntaxHighlight(metadata);
}

async function buildNativeScript(pkh) {
    // builds a native script for the connected wallet
    const scriptTemplate = {
        keyHash: '',
        type: 'sig'
    }

    scriptTemplate.keyHash = pkh;

    const lucid = await connectWalletToLucid();

    const lucidUtils = new Utils(lucid);
    
    console.log('script template', scriptTemplate);
    const nativeScript = lucidUtils.nativeScriptFromJson(scriptTemplate);
    return nativeScript;
}

async function mintTokenFromNativeScript(amount, tokenName, spinnerId) {

    console.log('mintTokenFromNativeScript start');
    const pkh = await getConnectedPKH();
    const nativeScript = await buildNativeScript(pkh);

    const lucid = await connectWalletToLucid();

    const ownWalletAddress = await lucid.wallet.address();

    console.log('native script', nativeScript);

    const tokenUnit = nativeScript.script + fromText(tokenName);

    const tx = await lucid.newTx()
        .mintAssets({[tokenUnit]: BigInt(amount)})
        .payToAddress(ownWalletAddress, { [tokenUnit]: BigInt(amount) })
        .attachMintingPolicy(nativeScript)
        .addSignerKey(pkh)
        .complete();

    signAndSubmitCardanoTx(tx, spinnerId);
        
    console.log('mintTokenFromNativeScript end');
}



/*
async function burnCIP68Tokens(tokenName, amount, spinnerId) {
    // TODO: This has not been tested. Must work with tokens currently in smart contract.
    // Modify by adding spend to get the token out of the contract and then burn it
    console.log('burnCIP68Tokens - '+ tokenName);
    if(amount > 0) {
        amount = -amount;
    }
    const lucid = await Lucid.new(new Blockfrost(blockfrost_api_url, blockfrost_api_key), blockfrost_api_env);

    const api = await window.cardano.nami.enable();
    lucid.selectWallet(api);

    const mintingPolicyScript = validators[mintingPolicyName];
    const policyId = lucid.utils.mintingPolicyToId(mintingPolicyScript);
    console.log("minting policy id: " + policyId);

    const refTokenUnit = policyId + cip68TokenName(tokenName, 'refNFT');
    const userTokenUnit = policyId + cip68TokenName(tokenName, 'userTokenNFT');

    const pkh = await getConnectedPKH();
    
    const tx = await lucid.newTx()
        .mintAssets({[refTokenUnit]: BigInt(amount), [userTokenUnit]: BigInt(amount)}, Data.void())
        .attachMintingPolicy(mintingPolicyScript)
        .addSignerKey(pkh)
        .complete();

    signAndSubmitCardanoTx(tx, spinnerId)
}*/

async function mintCIP68Tokens(tokenName, amount, metadata, spinnerId) {

    console.log('mintCIP68Tokens - '+ tokenName);

    const lucid = await connectWalletToLucid();

    const ocmScript = await getOCMScript();
    
    const policyId = lucid.utils.mintingPolicyToId(ocmScript);
    console.log("minting policy id: " + policyId);

    const refTokenUnit = policyId + cip68TokenName(tokenName, 'refNFT');
    const userTokenUnit = policyId + cip68TokenName(tokenName, 'userTokenNFT');

    const connectedWalletAddress = await lucid.wallet.address();

    const pmdScript = await getPMDScript();
    const pmdAddress = lucid.utils.validatorToAddress(pmdScript);

    const datumMetadata = Data.to(new Constr(0, [Data.fromJson(metadata), 1n])); // datum will be appended to witness set; only datum hash in reference output

    const pkh = await getConnectedPKH();
    
    const tx = await lucid.newTx()
        .mintAssets({ [refTokenUnit]: BigInt(amount), [userTokenUnit]: BigInt(amount) }, Data.void())
        .payToContract(pmdAddress, datumMetadata, { [refTokenUnit]: BigInt(amount) })
        .payToAddress(connectedWalletAddress, { [userTokenUnit]: BigInt(amount) })
        .attachMintingPolicy(ocmScript)
        .addSignerKey(pkh)
        .complete();

    signAndSubmitCardanoTx(tx, spinnerId)
    
}

async function mintCIP88Tokens(tokenName, amount, metadata, spinnerId) {

    console.log('mintCIP88Tokens - '+ tokenName);

    const lucid = await connectWalletToLucid();

    const pkh = await getConnectedPKH();
    const nativeScript = await buildNativeScript(pkh);
    
    const policyId = lucid.utils.mintingPolicyToId(nativeScript);
    console.log("native script policy id: " + policyId);

    const tokenUnit = policyId + fromText(tokenName);

    const ownWalletAddress = await lucid.wallet.address();

    const tx = await lucid.newTx()
        .mintAssets({[tokenUnit]: BigInt(amount) })
        .payToAddress(ownWalletAddress, { [tokenUnit]: BigInt(amount) })
        .attachMetadata(CIP88METADATALABEL, metadata)
        .attachMintingPolicy(nativeScript)
        .addSignerKey(pkh)
        .complete();

    signAndSubmitCardanoTx(tx, spinnerId)
    
}


async function getPMDUTxOs() {

    const lucid = await connectWalletToLucid();

    const validatorScript = await getPMDScript();
    const validatorAddress = lucid.utils.validatorToAddress(validatorScript);

    const utxosAtPMD = await lucid.utxosAt(validatorAddress);
    
    var utxoHTMLList = '<div>';
    for (var i = 0; i < utxosAtPMD.length; i++) {
        utxoHTMLList += '<div class="card">';
        if (utxosAtPMD[i].scriptRef) {
            const scriptRef = utxosAtPMD[i].scriptRef;
            const truncatedScript = truncate(scriptRef.script, 40, '...');
            utxoHTMLList += `<div class="card-body"><h5 class="card-title">Reference Script</h5><h6 class="card-subtitle mb-2 text-muted">${scriptRef.type}</h6><p class="card-text">${truncatedScript}</p>`;
            utxoHTMLList += `<a class="card-link" href="#" onclick="alert('{ txHash: &quot;${utxosAtPMD[i].txHash}&quot;, outputIndex: ${utxosAtPMD[i].outputIndex} }');">Display UTxO Info</a><a class="card-link" href="#" onclick="withdrawLovelace('${utxosAtPMD[i].txHash}',${utxosAtPMD[i].outputIndex},'withdraw${utxosAtPMD[i].txHash}${utxosAtPMD[i].outputIndex}Spinner', validatorName)">Withdraw</a><span class="spinner-border spinner-border-sm themed-link-color" role="status" id="withdraw${utxosAtPMD[i].txHash}${utxosAtPMD[i].outputIndex}Spinner" style="margin-left: 5px; display:none;"></span></div>`
        }
        else if (utxosAtPMD[i].assets) {
            const assets = utxosAtPMD[i].assets;
            utxoHTMLList += `<div class="card-body"><h5 class="card-title">Tokens</h5><h6 class="card-subtitle mb-2 text-muted">lovelace</h6><p class="card-text">${assets['lovelace']}</p>`;
            utxoHTMLList += `<a class="card-link" href="#" onclick="alert('{ txHash: &quot;${utxosAtPMD[i].txHash}&quot;, outputIndex: ${utxosAtPMD[i].outputIndex} }');">Display UTxO Info</a><a class="card-link" href="#" onclick="withdrawLovelace('${utxosAtPMD[i].txHash}',${utxosAtPMD[i].outputIndex},'withdraw${utxosAtPMD[i].txHash}${utxosAtPMD[i].outputIndex}Spinner', validatorName)">Withdraw</a><span class="spinner-border spinner-border-sm themed-link-color" role="status" id="withdraw${utxosAtPMD[i].txHash}${utxosAtPMD[i].outputIndex}Spinner" style="margin-left: 5px; display:none;"></span></div>`
        }
        utxoHTMLList += '</div>';
    }
    utxoHTMLList += '</div>';

    document.getElementById('pmd-utxo-list').innerHTML = `${utxoHTMLList}`;
}

async function submitCardanoTx(signedTx, spinnerId) {
    const tid = await signedTx.submit();
    console.log("Cardano tx submitted: " + tid);
    
    showElem(spinnerId);
    waitForTxConfirm(tid, spinnerId);
}

async function signAndSubmitCardanoTx(tx, spinnerId) {
    try {
        const signedTx = await tx.sign().complete();
        await submitCardanoTx(signedTx, spinnerId);
    } catch (err) {
        console.log(`Cardano transaction:\ninfo: ${err.info}\nmessage: ${err.message}`);
        throw (err);
    }
}

async function getConnectedPKH() {
    const lucid = await connectWalletToLucid();
    
    const bech32_addr = await lucid.wallet.address();
    const pkh = lucid.utils.getAddressDetails(bech32_addr).paymentCredential?.hash || "";

    return pkh;
}

async function waitForTxConfirm(txid, spinnerId) {
    
    console.log('waitForTxConfirm start '+ txid);

    const response = await fetch(`/api_tx_status`, {
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
        body: `{"_tx_hashes":["${txid}"]}`, // body data type must match "Content-Type" header
    });

    const jsonData = await response.json();
    
    if(jsonData[0].tx_hash == txid) {
        if(jsonData[0].num_confirmations > 0) {
            console.log('tx confirmed');
            // tx confirmed. stop spinner
            hideElem(spinnerId);
            // reload utxos
            getPMDUTxOs();
        }
        else {
            console.log('tx still not confirmed');
            // tx still not confirmed. wait 1 second and ask again
            setTimeout(waitForTxConfirm, 1000, txid, spinnerId);
        }
    }
}

function cip68TokenName(tokenName, tokenType) {

    if(tokenType == 'refNFT') {
        return toLabel(100) + fromText(tokenName);
    }
    else if(tokenType == 'userTokenNFT') {
        return toLabel(222) + fromText(tokenName);
    }
    else if(tokenType == 'userTokenFT') {
        return toLabel(333) + fromText(tokenName);
    }
    else if(tokenType == 'userTokenRFT') {
        return toLabel(444) + fromText(tokenName);
    }
    
    // if this point is reached, the type of token requested in unsupported 
    return '';
}

getPMDUTxOs();

window.getPMDUTxOs = getPMDUTxOs;
window.getConnectedPKH = getConnectedPKH;
window.waitForTxConfirm = waitForTxConfirm;
window.mintCIP68Tokens = mintCIP68Tokens;
window.mintCIP88Tokens = mintCIP88Tokens;
//window.burnCIP68Tokens = burnCIP68Tokens;
window.cip68TokenName = cip68TokenName;
window.buildNativeScript = buildNativeScript;
window.mintTokenFromNativeScript = mintTokenFromNativeScript;
window.getAssetInfo = getAssetInfo;
window.getPMDScript = getPMDScript;
window.hashData = hashData;
window.signData = signData;




