/*const CIP68METADATATEMPLATE = { 
    "name": "CENT NFT 1",
    "image": "https://cent.stakepoolcentral.com/resources/SPC.png",
    "description": "CENT CIP68 NFT"
}

const CIP88METADATATEMPLATE = {
    0: 1,
    1: {
        1: [
            0,
            '3668b628d7bd0cbdc4b7a60fe9bd327b56a1902e89fd01251a34c8be',
            '8200581c4bdb4c5017cdcb50c001af21d2488ed2e741df55b252dd3ab2482050'
        ],
        2: [
            25,
            27
        ],
        3: [0],
        4: 12345,
        5: [
            "https://",
            "oracle.mycoolnftproject.io/"
        ],
        6: {
            25: {
                0: 1,
                1: {
                    0: "Cool NFT Project",
                    1: [
                        "This is a description of my project",
                        "longer than 64 characters so broken up into a string array"
                    ],
                    2: [
                        "https://",
                        "static.coolnftproject.io",
                        "/images/icon.png"
                    ],
                    3: [
                        "https://",
                        "static.coolnftproject.io",
                        "/images/banner1.jpg"
                    ],
                    4: 0,
                    5: [
                        [
                            "twitter",
                            [
                                "https://",
                                "twitter.com/spacebudzNFT"
                            ]
                        ],
                        [
                            "discord",
                            [
                                "https://",
                                "discord.gg/spacebudz"
                            ]
                        ]
                    ],
                    6: "Virtua Metaverse"
                }
            },
            27: {
                0: 1,
                1: {
                    1: "0.05",
                    2: [
                        "addr_test1qqp7uedmne8vjzue66hknx87jspg56qhkm4gp6ahyw7kaahevmtcux",
                        "lpy25nqhaljc70094vfu8q4knqyv6668cvwhsq64gt89"
                    ]
                }
            }
        }
    },
    2: [
        [
            '02b76ae694ce6549d4a20dce308bc7af7fa5a00c7d82b70001e044e596a35deb',
            '23d0614301b0d554def300388c2e36b702a66e85432940f703a5ba93bfb1659a',
            '0717962b40d87523c507ebe24efbb12a2024bb8b14441785a93af00276a32e08'
        ],
        [
            '26bacc7b88e2b40701387c521cd0c50d5c0cfa4c6c6d7f0901395757',
            'secondWitnessByteString...split into 2 because length of',
            'signatures are 128 bytes long ..........................'
        ]
    ]
}
*/

// async function connectwallet(name) {
//     const api = await window.cardano[name].enable();
// }

/*
function truncate(fullStr, strLen, separator) {
    if (fullStr.length <= strLen) return fullStr; separator = separator || '...';
    var sepLen = separator.length;
    var charsToShow = strLen - sepLen;
    var frontChars = Math.ceil(charsToShow / 2);
    var backChars = Math.floor(charsToShow / 2);
    return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
};*/

function showElem(elemid) {
    document.getElementById(elemid).style.display = '';
}

function hideElem(elemid) {
    document.getElementById(elemid).style.display = 'none';
}

var validatorName = '';
var validatorUTxOList = '';


function setCookie(cookiename, value) {
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth()+1);
    
    document.cookie = `${cookiename}=${value}; expires=${expirationDate};`;
}

function showSearchFields() {
    showElem('search_tokens_label');
    showElem('search_fields');
}

function hideSearchFields() {
    hideElem('search_tokens_label');
    hideElem('search_fields');
}

async function getVerificationBoxHTML(assetInfo, cip27Asset, cip68RefTokens, complianceReport) {

    var compliantCIPs = '';
    var nonCompliantCIPs = '';
    const disregardCIPs = [];
    
    //TODO: Remove cip68RefTokens parameter if it turns out to be N/A. Keeping it here for now in the event that it can be used for any verification status info
    if(complianceReport['68'].metadata != null) {
        // this is a cip 68 NFT. disregard cip 88
        disregardCIPs.push('88');
    }
    // else if(complianceReport['88'].metadata != null){
    //     // this is a cip 88 NFT. disregard cip 68
    //     disregardCIPs.push('68');
    // }
    else if(complianceReport['25'].metadata != null) {
        // this is a cip 25 NFT. disregard cip 68 and cip 88
        disregardCIPs.push('68');
        disregardCIPs.push('88');
    }


    Object.keys(complianceReport).forEach((cip) => {
        errors = complianceReport[cip].errors;
        if (errors.length == 0) {
            compliantCIPs += `, ${cip}`
            if(complianceReport[cip].metadata != null) {
                compliantCIPs += `<button type="button" onclick="document.getElementById('cip-details-metadata').innerHTML='<table>${logTheObj(complianceReport[cip].metadata, false)}</table>'; showElem('cip-details-metadata-fields'); const cipDetails = new bootstrap.Modal('#cipDetails', { keyboard: false }); hideElem('cip-details-error-fields'); cipDetails.show()">DETAILS</button>`
            }
        }
        else if(!disregardCIPs.includes(cip)){
            // there are errors for a cip that is not disregarded
            nonCompliantCIPs += `<div class="d-flex justify-content-start item-text failed">${cip} CONTAINS ERRORS
            <button onclick="document.getElementById('cip-details-error-list').innerHTML='<table>${logTheObj(errors, false)}</table>';`;
            if(complianceReport[cip].metadata != null) {
                nonCompliantCIPs += `document.getElementById('cip-details-metadata').innerHTML='<table>${logTheObj(complianceReport[cip].metadata, false)}</table>'; showElem('cip-details-metadata-fields');`;
            }
            else {
                nonCompliantCIPs +=`hideElem('cip-details-metadata-fields');`;
            }
            nonCompliantCIPs += `const cipDetails = new bootstrap.Modal('#cipDetails', { keyboard: false }); showElem('cip-details-error-fields'); cipDetails.show();")">DETAILS</button>`;
            
            nonCompliantCIPs += `</div>`
        }
    });

    var cipRoyaltyRate = '<td class="item-text';
    if(cip27Asset != null) {
        const cip27Metadata = cip27Asset.minting_tx_metadata['777'];
        const ratePropNames = ['rate','pct']; // rate is current. pct is version 1 of CIP 27
        var rate = null;
        for(var i = 0; i < ratePropNames.length && rate == null; i++) {
            rate = cip27Metadata[ratePropNames[i]];
        }
        
        if(rate != null) {
            // rate found
            ratePct = parseFloat(rate) * 100;
            cipRoyaltyRate += `">${ratePct}%`
        }
        else {
            // rate not found
            cipRoyaltyRate += ` failed">NOT FOUND`
        }
    }
    else {
        // rate not found
        cipRoyaltyRate += ` failed">NOT FOUND`
    }
    cipRoyaltyRate += "</td>";

    var asset_name = getAssetName(complianceReport);

    var twitter = getTwitter(complianceReport);
    
    var discord = getDiscord(complianceReport);

    if(complianceReport['88'].metadata == null) {
        return `
    <div class="d-flex justify-content-center">
        <div class="verification-box">
            <div width="100%" class="d-flex justify-content-between non-cip88-header">
                <div>&nbsp;</div>
            </div>
            <table style="width: 100%;">
                <tr><th class="item-name top-row">NAME :</th><td class="item-text top-row">${asset_name}</td></tr>
                <tr><th class="item-name">ROYALTY RATE :</th>${cipRoyaltyRate}</tr>
                <tr><th class="item-name">CIP COMPLIANCE :</th><td class="item-text"><div class="d-flex justify-content-start item-text successful">${compliantCIPs.substring(1)}</div>${nonCompliantCIPs}</td></tr>
                <tr><th class="item-name">TWITTER :</th><td class="item-text">${twitter}</td></tr>
                <tr><th class="item-name bottom-row">DISCORD :</th><td class="item-text bottom-row">${discord}</td></tr>
            </table>
        </div>
    </div>`;
    }
    // this is a CIP 88 token
    const projectBannerURI = getCIP88ProjectBannerURL(complianceReport['88'].metadata);
    const projectImageURI = getCIP88ProjectImageURL(complianceReport['88'].metadata);
    var nativeScriptPolicyIdMatch = false;
    var isOwnerAndValidSignature = true;
    const payload = complianceReport['88'].metadata['1'];
    const witnesses = complianceReport['88'].metadata['2'];
    if(payload != null && witnesses != null) {
        
        const scope = payload['1'];

        if(scope[0] == '0') {
            const cip88VerificationReport = await verifyCIP88Cert(payload, witnesses);

            nativeScriptPolicyIdMatch = cip88VerificationReport.policyIdMatch;

            const wValidation = cip88VerificationReport.witnessValidation;
            for(var x = 0; x < wValidation.length; x++) {
                // Looping through all witness signatures and checking they are made by one of the required signers and that it is valid
                // If one is invalid, the isOwnerAndValidSignature will be false
                isOwnerAndValidSignature = isOwnerAndValidSignature && wValidation[x].requiredSigner && wValidation[x].witnessSignatureValid;
            }
        }
        else {
            // currently only native scripts witnesses are supported by CIP 88
            isOwnerAndValidSignature = false;
        }
    }
    else {
        console.log('policyScript is null');
    }

    return `
    <div class="d-flex justify-content-center">
        <div class="verification-box">
            <div width="100%" class="d-flex justify-content-between">
                ${projectBannerURI != '' ? `<img class="collection-banner p-2 w-100" loading="lazy" height="100" src='${projectBannerURI}'/>` : '<div class="collection-banner p-2 w-100">Project Banner<br>-Not Found-</div>'}
                ${projectImageURI != '' ? `<img class="collection-icon p-2 flex-shrink-1" loading="lazy" height="100" src='${projectImageURI}'/>` : '<div class="collection-icon p-2 flex-shrink-1">Project Image<br>-Not Found-</div>'}
            </div>
            <table style="width: 100%;">
                <tr><th class="item-name top-row">NAME :</th><td class="item-text top-row">${asset_name}</td></tr>
                <tr><th class="item-name">NATIVE SCRIPT :</th><td class="item-text ${nativeScriptPolicyIdMatch ? 'successful' : 'failed'}">${nativeScriptPolicyIdMatch ? 'MATCHES SCRIPT' : 'NOT MATCHING SCRIPT'}</td></tr>
                <tr><th class="item-name">PUBKEY HASH :</th><td class="item-text ${isOwnerAndValidSignature ? 'successful' : 'failed'}">${isOwnerAndValidSignature ? 'MATCHES SCRIPT' : 'NOT MATCHING SCRIPT'}</td></tr>
                <tr><th class="item-name">ROYALTY RATE :</th>${cipRoyaltyRate}</tr>
                <tr><th class="item-name">CIP COMPLIANCE :</th><td class="item-text"><div class="d-flex justify-content-start item-text successful">${compliantCIPs.substring(1)}</div>${nonCompliantCIPs}</td></tr>
                <tr><th class="item-name">TWITTER :</th><td class="item-text">${twitter}</td></tr>
                <tr><th class="item-name bottom-row">DISCORD :</th><td class="item-text bottom-row">${discord}</td></tr>
            </table>
        </div>
    </div>`;
    
}

function getCIP88Witnesses(metadata) {
    
    // Get Project Details
    const projectDetails = metadata['1'];
    if (!isObject(projectDetails)) {
        return null;
    }
    
    // Get Scope
    const scope = projectDetails['1'];
    if (!Array.isArray(scope)) {
        console.error('scope', scope);
        return null;
    }
    
    if(scope.length != 3) {
        return null;
    }
    
    if( scope[0] == 0) {
        // this is a Native script
        const policyID = scope[1]
        if(!isHex(policyID, 56)) {
            return null;
        }
        const policyScriptHex = scope[2].join('');
        if(!isHex(policyScriptHex)) {
            return null;
        }

        return {type: 'native script', policy_id: policyID, policy_script: policyScriptHex};
    }
    
    // This type is not defined
    return null;
}

function getCIP88Scope(metadata) {
    
    // Get Project Details
    const projectDetails = metadata['1'];
    if (!isObject(projectDetails)) {
        return null;
    }
    
    // Get Scope
    const scope = projectDetails['1'];
    if (!Array.isArray(scope)) {
        console.error('scope', scope);
        return null;
    }
    
    if(scope.length != 3) {
        return null;
    }
    
    if( scope[0] == 0) {
        // this is a Native script
        const policyID = scope[1]
        if(!isHex(policyID, 56)) {
            return null;
        }
        const policyScriptHex = scope[2].join('');
        if(!isHex(policyScriptHex)) {
            return null;
        }

        return {type: 'native script', policy_id: policyID, policy_script: policyScriptHex};
    }
    
    // This type is not defined
    return null;
}


function getCIP88ProjectImageURL(metadata) {
    
    // Get Project Details
    const projectDetails = metadata['1'];
    if (!isObject(projectDetails)) {
        return "";
    }

    // Get CIP Details
    const cipDetails = projectDetails['6'];
    if (!isObject(cipDetails)) {
        return "";
    }

    // metadata parameter contains the metadata in the CIP details element
    const cipsContainingImageInfo = ['25', '68'];
    
    for(var i = 0; i < cipsContainingImageInfo.length; i++) {
        if(cipDetails[cipsContainingImageInfo[i]] == null) continue;
            
        // metadata defined for this CIP...check if Project Image is defined
        const cipMetadata = cipDetails[cipsContainingImageInfo[i]];
        if(cipMetadata['1'] == null) continue;
                
        // Token Collection Details is defined
        const collectionDetails = cipMetadata['1'];

        if(collectionDetails['2'] == null) continue;
                    
        // Project Image is defined
        var image = collectionDetails['2'];
        if(Array.isArray(image)) {
            image = image.join('');
            if (image.indexOf('Qm') > -1) {
                var ipfsID = image.substring(image.indexOf('Qm'));
                image = `https://d28yzo4ezrm37i.cloudfront.net/image/${ipfsID}`
            }
            else if (image.indexOf('ipfs://') > -1) {
                var ipfsID = image.substring(image.lastIndexOf('//') + 2);
                image = `https://d28yzo4ezrm37i.cloudfront.net/image/${ipfsID}`
            }
            return image;
        }
    }

    // if this point is reached, no image was defined in the metadata
    return "";
}

function getCIP88ProjectBannerURL(metadata) {

    // Get Project Details
    const projectDetails = metadata['1'];
    if (!isObject(projectDetails)) {
        return "";
    }

    // Get CIP Details
    const cipDetails = projectDetails['6'];
    if (!isObject(cipDetails)) {
        return "";
    }

    // metadata parameter contains the metadata in the CIP details element
    const cipsContainingBannerInfo = ['25', '68'];
    
    for(var i = 0; i < cipsContainingBannerInfo.length; i++) {
        if(cipDetails[cipsContainingBannerInfo[i]] == null) continue;
            
        // metadata defined for this CIP...check if Project Banner is defined
        const cipMetadata = cipDetails[cipsContainingBannerInfo[i]];
        if(cipMetadata['1'] == null) continue;
                
        // Token Collection Details is defined
        const collectionDetails = cipMetadata['1'];
        if(collectionDetails['3'] == null) continue;
                    
        // Project Banner is defined
        var banner = collectionDetails['3'];
        if(Array.isArray(banner)) {
            banner = banner.join('');
            if (banner.indexOf('Qm') > -1) {
                ipfsID = banner.substring(banner.indexOf('Qm'));
                banner = `https://d28yzo4ezrm37i.cloudfront.net/image/${ipfsID}`
            }
            else if (banner.indexOf('ipfs://') > -1) {
                ipfsID = banner.substring(banner.lastIndexOf('//') + 2);
                banner = `https://d28yzo4ezrm37i.cloudfront.net/image/${ipfsID}`
            }
            return banner;
        }
    }

    // if this point is reached, no banner was defined in the metadata
    return "";
}

function getCIP25Discord(metadata) {
    // in CIP 25 discord is in a named property
    const cip25Discord = ["discord"];
    var discord = null;
    for(var i = 0; i < cip25Discord.length; i++) {
        if(metadata.hasOwnProperty(cip25Discord[i])) {
            discord = metadata[`${cip25Discord[i]}`];
            break;
        }
    }
    return discord;
}

function getCIP25Twitter(metadata) {
    // in CIP 25 twitter is in a named property
    const cip25Twitter = ["twitter", "twitter2", "x-Artist"];
    var twitter = null;
    for(var i = 0; i < cip25Twitter.length; i++) {
        if(metadata.hasOwnProperty(cip25Twitter[i])) {
            twitter = metadata[`${cip25Twitter[i]}`];
            break;
        }
    }
    return twitter;
}

function getCIP88SocialMedia(metadata, protocol) {
    // in CIP 88 social media protocols are defined in the 'Social Media' element if present
    // The Social Media element is located in the Registration Payload > CIP Details

    // metadata parameter contains the metadata in the CIP details element
    const cipsContainingTwitterInfo = ['25', '68'];
    
    for(var i = 0; i < cipsContainingTwitterInfo.length; i++) {
        if(metadata[cipsContainingTwitterInfo[i]] == null) continue;
            
        // metadata defined for this CIP...check if twitter is defined
        const cipMetadata = metadata[cipsContainingTwitterInfo[i]];
        if(cipMetadata['1'] == null) continue;
                
        // Token Collection Details is defined
        const collectionDetails = cipMetadata['1'];
        if(collectionDetails['5'] == null) continue;
                    
        // Social Media is defined
        const socialMedias = collectionDetails['5'];
        for(var j = 0; j < socialMedias.length; j++) {
            if(socialMedias[i][0] == protocol) {
                // we found the definition for the wanted social media protocol in entry 0
                // return the url of the social media protocol (entry 1)
                return socialMedias[i][1].join('');
            }
        }
    }

    // if this point is reached, no social media was defined in the metadata
    return null;
}

function getAssetName(complianceReport) {
    var asset_name = null;
    if(complianceReport[25].metadata != null) {
        // CIP 25
        asset_name = complianceReport[25].metadata.name;
    }
    else if(complianceReport[68].metadata != null) {
        // CIP 68...follows CIP 25 metadata structure
        asset_name = complianceReport[68].metadata.name;
    }
    
    if(asset_name == null) return `NOT FOUND IN METADATA`;

    return asset_name;
}

function getTwitter(complianceReport) {
    var twitter = null;
    if(complianceReport[88].metadata != null) {
        // CIP 88
        const cipDetails = complianceReport[88].metadata['1']['6'];
        twitter = getCIP88SocialMedia(cipDetails, 'twitter');
    }
    else if(complianceReport[25].metadata != null) {
        // CIP 25
        twitter = getCIP25Twitter(complianceReport[25].metadata);
    }
    else if(complianceReport[68].metadata != null) {
        // CIP 68...follows CIP 25 metadata structure
        twitter = getCIP25Twitter(complianceReport[68].metadata);
    }
    
    if(twitter == null) return `NOT FOUND IN METADATA`;

    twitterAccount = twitter.substring(twitter.lastIndexOf('/')+1);
    return `<a href="${twitter}" target="_blank" class="box-link">@${twitterAccount.toUpperCase()}</a>`;
}

function getDiscord(complianceReport) {
    var discord = null;
    if(complianceReport[88].metadata != null) {
        // CIP 88
        const cipDetails = complianceReport[88].metadata['1']['6'];
        discord = getCIP88SocialMedia(cipDetails, 'discord');
    }
    else if(complianceReport[25].metadata != null) {
        // CIP 25
        discord = getCIP25Discord(complianceReport[25].metadata);
    }
    else if(complianceReport[68].metadata != null) {
        // CIP 68...follows CIP 25 metadata structure
        discord = getCIP25Discord(complianceReport[68].metadata);
    }
    
    if(discord == null) return `NOT FOUND IN METADATA`;

    return `<a href="${discord}" target="_blank" class="box-link">JOIN SERVER</a>`;
}

async function toVerificationBoxes(assetList, checkCIPs, elemid) {
    var boxHTMLCode = '';
    
    // loop through the asset list to locate the cip 27 royalty token as this is common for all tokens of the policy, and needed in
    // verification box of all tokens but should not have a verification box on its own
    var cip27Asset;
    const cip68RefTokens = [];
    const assets = [];
    for(var i = 0; i < assetList.length; i++) {
        if(assetList[i].asset_name.startsWith(cip68RefTokenLabel)) {
            // this is a CIP 68 ref token and should not have its own verification box. Save for later
            cip68RefTokens.push(assetList[i]) 
        }
        else if(assetList[i].asset_name != '') {
            // this is a regular asset. Add it to the list
            assets.push(assetList[i]);
        }
        else {
            if(assetList[i].minting_tx_metadata != null) {
                if(assetList[i].minting_tx_metadata['777'] != null) {
                    // we located the CIP 27 asset. Save metadata for later
                    cip27Asset = assetList[i];
                }
            }
        }
    }

    for(var i = 0; i < assets.length; i++) {
        var complianceReport = await verifyCIPCompliance(assets[i], cip27Asset, cip68RefTokens, checkCIPs);
        boxHTMLCode += await getVerificationBoxHTML(assets[i], cip27Asset, cip68RefTokens, complianceReport);
    }
    document.getElementById(elemid).innerHTML = boxHTMLCode;
}

function cip25Compliance(assetInfo) {
    // https://github.com/cardano-foundation/CIPs/blob/master/CIP-0025
    const requiredFields = ['name', 'image'];
    const errors = [];
    var metadata = null;

    if(assetInfo.minting_tx_metadata == null) {
        errors.push("No minting tx metadata found");
    }
    else {
        metadata = assetInfo.minting_tx_metadata;
        if(metadata['721'] == null) {
            errors.push("No CIP 25 metadata specified");
        }
    }

    if(errors.length > 0) {
        // metadata not specified. No need to continue from this point
        return {errors: errors, metadata: null};
    }
    
    const versionOfCIP = metadata['721'].version == null ? '1' : `${metadata['721'].version}`;
    var policyMetadata, assetMetadata;
    if(versionOfCIP == '1' || versionOfCIP == '1.0') {
        // the policy_id must be in text format for the key in the metadata map
        // the asset_name must be utf-8 encoded and in text format for the key in the metadata map
        if(metadata['721'][`${assetInfo.policy_id}`] == null) {
            errors.push("Policy id not formatted according to version 1 of CIP25");
        }
        policyMetadata = metadata['721'][`${assetInfo.policy_id}`];

        if(policyMetadata[`${assetInfo.asset_name_ascii}`] == null) {
            errors.push("Asset name not formatted according to version 1 of CIP25");
        }
        
        assetMetadata = policyMetadata[`${assetInfo.asset_name_ascii}`];
        
    }
    else if(versionOfCIP == '2' || versionOfCIP == '2.0') {
        // the policy_id must be in raw bytes format
        // the asset_name must be in raw bytes format
        if(metadata['721'][`${assetInfo.policy_id}`] == null) {
            errors.push("Policy id not formatted according to version 1 of CIP25");
        }
        policyMetadata = metadata['721'][`${assetInfo.policy_id}`];

        if(policyMetadata[`${assetInfo.asset_name}`] == null) {
            errors.push("Asset name not formatted according to version 1 of CIP25");
        }
        
        assetMetadata = policyMetadata[`${assetInfo.asset_name}`];

    }
    else {
        errors.push(`Version ${versionOfCIP} of CIP25 is not supported by the verification tool`);
    }

    requiredFields.forEach((fieldName) => {
        if(!assetMetadata.hasOwnProperty(fieldName)) {
            errors.push(`Required field ${fieldName} of CIP25 not present`);
        }
    });

    return {errors: errors, metadata: assetMetadata};
}



function cip68Compliance(assetInfo, cip68RefTokens) {
    // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0068
    const errors = [];

    if(assetInfo.cip68_metadata == null) {
        errors.push("No CIP 68 metadata specified")
    }

    // CIP 68 metadata is handled by Koios API, but we do an additional verification that the ref token is in fact on chain
    var tokenLabel = null; 
    for(var i = 0; i < cip68UserTokenLabels.length; i++) {
        label = cip68UserTokenLabels[i];
        if(assetInfo.asset_name.startsWith(label)) {
            // this is a cip68 user token. Verify that we have a cip68RefToken
            tokenLabel = label;
            if(!inAssetList(assetInfo.asset_name.replace(label, cip68RefTokenLabel), cip68RefTokens)) {
                errors.push("No CIP 68 ref token found on-chain");
            }
        }
    }

    if(errors.length > 0) {
        // metadata not specified. No need to continue from this point
        return {errors: errors, metadata: null};
    }

    const cip68MetadataRaw = assetInfo.cip68_metadata;
    
    const cip68TokenLabel = cip68TokenTypeFromLabel(tokenLabel);

    const cip68Metadata = cip68MetadataRaw[cip68TokenLabel];

    if(cip68Metadata == null) {
        errors.push('No CIP 68 metadata found for label '+ cip68TokenLabel)
        return {errors: errors, metadata: cip68Metadata};
    }

    if(cip68Metadata.fields == null || cip68Metadata.constructor == null) {
        errors.push("CIP 68 metadata not structured correctly");
        return {errors: errors, metadata: cip68Metadata};
    }

    if(cip68Metadata.fields.length != 3 || cip68Metadata.constructor != 0) {
        errors.push("CIP 68 metadata not structured correctly");
        return {errors: errors, metadata: cip68Metadata};
    }

    const token_metadata = cip68Metadata.fields[0];
    const token_version = cip68Metadata.fields[1]; // Keep for now and implement if applicable at a later stage
    const token_extra = cip68Metadata.fields[2]; // Keep for now and implement if applicable at a later stage

    if(token_metadata.map == null) {
        errors.push("CIP 68 metadata does not contain a map");
        return {errors: errors, metadata: cip68Metadata};
    }

    const decodedMetadata = decodeObject(token_metadata.map);
    
    requiredFields = ['name', 'image']; // required fields of CIP 25...hence required by CIP 68
    requiredFields.forEach((fieldName) => {
        if(!decodedMetadata.hasOwnProperty(fieldName)) {
            errors.push(`Required field ${fieldName} of CIP25/68 not present`);
        }
    });

    return {errors: errors, metadata: decodedMetadata};
    //return {errors: errors, metadata: [decodedMetadata, token_version, token_extra]};
}

function decodeObject(map) {
    const decodedMetadata = {};
    var decodedKeyValuePair;
    for(var i = 0; i < map.length; i++) {
        decodedKeyValuePair = decodeKeyValuePair(map[i]);
        decodedMetadata[decodedKeyValuePair.k] = decodedKeyValuePair.v
    }
    return decodedMetadata;
}

function decodeValue(value) {
    var value_ascii;

    if (value['int'] != null) {
        value_ascii = value['int'];
    }
    else if (value['string'] != null) {
        value_ascii = value['string'];
    }
    else if (value['bytes'] != null) {
        value_ascii = decodeValue(value['bytes']);
    }
    else if (value['list'] != null) {
        value_ascii = decodeListValues(value['list']);
    }
    else if (value['map'] != null) {
        value_ascii = decodeObject(value['map']);
    }
    else if (isHex(value)) {
        switch(value.length) {
            case 56: 
                // hex of length 56. likely policy id. Fall through
            case 64: 
                // hex of length 64. likely hash256. Fall through
            case 128:
                // hex of length 128. likely signature hash.

                // special hex are left as is
                value_ascii = value;
                break;
            default: 
                // converting hex to ascii as length is nothing special
                value_ascii = hex_to_ascii(value);
        }
    }
    else {
        // value is not hex encoded. Leave as is
        value_ascii = value;
    }
    
    return value_ascii;
}

function decodeListValues(list) {
    const decodedList = [];
    for(var i = 0; i < list.length; i++) {
        decodedList.push(decodeValue(list[i]));
    }
    return decodedList;
}

function decodeKeyValuePair(tupple) {
    var key_ascii = null, value_ascii = null;
    if(tupple.k != null) {
        if(tupple.k['int'] != null) {
            key_ascii = tupple.k['int'];
        }
        else if(tupple.k['bytes'] != null) {
            key_ascii = hex_to_ascii(tupple.k['bytes']);
        }
        else if(tupple.k['string'] != null) {
            key_ascii = tupple.k['string'];
        }
        else {
            console.log('unsupported key type', JSON.stringify(tupple));
        }
    }

    if(tupple.v != null) {
        value_ascii = decodeValue(tupple.v);
    }
    else {
        console.log('v == null');
    }

    if(key_ascii != null && value_ascii != null) {
        return { k: key_ascii, v: value_ascii };
    }

    return {};
}

function inAssetList(assetName, assetList) {
    for(var i = 0; i < assetList.length; i++) {
        if(assetList[i].asset_name == assetName) {
            return true;
        }
    }
    return false;
}

function logTheObj(obj,inArray) {
    var ret = "";
  
    if(typeof obj === 'string') {
      ret += `<tr><th>&nbsp;</th><td class=&quot;item-text&quot;>` + obj.replace("\'", "_") +"</td></tr>";
    }
    else {
      for (var o in obj) {
        var data = obj[o];  
        if (typeof data !== 'object') {
            data = data.toString().replace("\'", "_");
            ret += `<tr><th class=&quot;item-name&quot;>`+ o + `</th><td class=&quot;item-text&quot;>` + data +"</td></tr>";
        }
        else {
          ret += `<tr><th class=&quot;item-name&quot;>`+ o + "</th><td class=&quot;text-nowrap&quot;><table width=&quot;100%&quot;>" + logTheObj(data,inArray) +"</table></td></tr>";
        }
      }
    }
    
    return ret;
  }
  
  
  const hex_64_char = '^[0-9a-fA-F]{64}$';
  
  function isValidUrl(urlstring) {
    try {
      url = new URL(urlstring);
    } catch (_) {
      return false;  
    }
    return true;
  }


function hex_to_ascii(str1) {
    var hex = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}

function isObject(o) {
    // verify that the provided parameter is of type object not null and is not an array.
    // by object we mean a struct with named properties (map) like example {prop1: "value1", prop2: 42, prop3: ["value31","value32"] }
    return (typeof o === 'object' && !Array.isArray(o) && o !== null);
}

function isBech32Array(addrList, msgPrefix) {
    const errors = [];
    if(!Array.isArray(addrList)) {
        errors.push(`${msgPrefix} shall be an array of bech32 addresses ["addr1...", "addr1...", ...]`);
    }
    else if(addrList.length % 2 != 0) {
        errors.push(`${msgPrefix} contains an uneven number of elements to contain valid bech32 addresses`);
    }

    var address, invalidAddr;
    for(var i = 0; i < addrList.length; i+=2) {
        address = addrList[i] + addrList[i+1];
        invalidAddr = false;
        if(address.startsWith("addr1")) {
            if(!isLettersAndNumbers(address.substring("addr1".length))) {
                invalidAddr = true;
            }
        }
        else if(address.startsWith("addr_test1")) {
            if(!isLettersAndNumbers(address.substring("addr_test1".length))) {
                invalidAddr = true;
            }
        }
        
        if(invalidAddr) {
            errors.push(`${msgPrefix} ${address} is not a valid bech32 address`);
        }
    }
    return errors;
}

function isSocialMediaHandleArray(sma, msgPrefix) {
    var errors = [];
    
    if(!Array.isArray(sma)) {
        errors.push(`${msgPrefix} shall be an array of social media handle arrays [[social-media-title, [uri_scheme, ...]]]`);
    }

    if(errors.length > 0) {
        // The element is not an array. No need to continue from this point
        return errors;
    }

    var socialMediaHandle;
    for(var i = 0; i < sma.length; i++) {
        socialMediaHandle = sma[i];
        if(!Array.isArray(socialMediaHandle)) {
            errors.push(`${msgPrefix} Entry ${i+1} is not a social media handle array [social-media-title, [uri_scheme, ...]]`);
        }
        else if(socialMediaHandle.length != 2) {
            errors.push(`${msgPrefix} Entry ${i+1} is not a social media handle array two entries [social-media-title, [uri_scheme, ...]]`);
        }
        else if(socialMediaHandle[0] == null || socialMediaHandle[0].trim() == '') {
            errors.push(`${msgPrefix} Entry ${i+1} social-media-title cannot be empty`);
        }
        else {
            errors = errors.concat(isURIArray(socialMediaHandle[1], `${msgPrefix} Entry ${i+1}`))
        }
    }

    return errors;
}

function isURIArray(ua, msgPrefix) {
    const errors = [];
    const uriSchemes = ['https://', 'ar://', 'ipfs://'];
    if(!Array.isArray(ua)) {
        errors.push(`${msgPrefix} shall be an array [uri_scheme, ..., ...]`);
    }
    else if(ua.length < 2) {
        errors.push(`${msgPrefix} shall be an array with at least 2 strings [uri_scheme, ..., ...]`);
    }
    else if(!uriSchemes.includes(ua[0])) {
        if(ua[0].length < 5) {
            errors.push(`${msgPrefix} first entry must be a URI scheme of minimum length 5`);
        } 
        else if(!ua[0].endsWith('://')) {
            errors.push(`${msgPrefix} first entry must be a URI scheme ending with ://`);
        }
    }
    else {
        const uri = ua.join('');
        if(!isValidUrl(uri)) {
            errors.push(`${msgPrefix} does not contain a valid URI`);
        }
    }

    return errors;
}

function isTokenIdentifier(ti, msgPrefix) {
    const errors = [];
    if(!Array.isArray(ti)) {
        errors.push(`${msgPrefix} shall be an array [policy_id,asset_id]`);
    }
    else if(ti.length != 2) {
        errors.push(`${msgPrefix} shall be an array [policyId,assetId]`);
    }
    else if(!isHex(ti[0], 56)) {
        errors.push(`${msgPrefix} policy id is not 56 hex`);
    }
    else if(!isHex(ti[1])) {
        errors.push(`${msgPrefix} asset id is not hex`);
    }

    return errors;
}

function cip88Ext_25Compliance(assetInfo) {
    // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0088/CIPs/0025
    // https://github.com/cardano-foundation/CIPs/blob/master/CIP-0088/CIPs/common/Token-Project-Details_v1.md
    
    var errors = [];
    const versionOfCIP = assetInfo['0'] == null ? 1 : `${assetInfo['0']}`;
    if(isNaN(versionOfCIP)) {
        errors.push("CIP 25 Optional field 0: &quot;Version&quot; is not a number");
    }

    const details = assetInfo['1'];
    if(!isObject(details)) {
        errors.push("CIP 25 Required field 1: &quot;Token Collection Details&quot; is not defined as object");
    }

    if(errors.length > 0) {
        // metadata not specified. No need to continue from this point
        return errors;
    }

    // Validate 0. Collection Name
    const collection = details['0'];
    if(collection == null || collection.trim() == '') {
        errors.push(`CIP 25 Required field 1-0: &quot;Collection Name&quot; cannot be empty`);
    }

    // Validate 1. Description
    const description = details['1'];
    if(description != null) {
        if(!Array.isArray(description)) {
            errors.push(`CIP 25 Optional field 1-1: &quot;Description&quot; is not an array`);
        }
    }

    // Validate 2: Project Image
    const image = details['2'];
    if(image != null) {
        errors = errors.concat(
            isURIArray(image, `CIP 25 Optional field 1-2: &quot;Project Image&quot;`)
        );
    }

    // Validate 3: Project Banner
    const banner = details['3'];
    if(banner != null) {
        errors = errors.concat(
            isURIArray(banner, `CIP 25 Optional field 1-3: &quot;Project Banner&quot;`)
        );
    }

    // Validate 4: NSFW Flag (Not Safe for Work)
    const nsfw = details['4'];
    if(nsfw != null) {
        if(nsfw != '0' && nsfw != '1') {
            errors.push(`CIP 25 Optional field 1-4: &quot;NSFW&quot; can be either 0 or 1`);
        }
    }

    // Validate 5: Social Media
    const socials = details['5'];
    if(socials != null) {
        if(!Array.isArray(socials)) {
            errors.push(`CIP 25 Optional field 1-5: &quot;Social Media&quot; is not an array`);
        }
        else {
            errors = errors.concat(
                isSocialMediaHandleArray(socials, `CIP 25 Optional field 1-5: &quot;Social Media&quot;`)
            );
        }
    }

    // Validate 6: Project/Artist Name
    const projectName = details['6'];
    if(projectName != null) {
        if(projectName.trim() == '') {
            errors.push(`CIP 25 Optional field 1-6: &quot;Project/Artist Name&quot; cannot be empty when defined`);
        }
    }
    
    return errors;
}

function cip88Ext_26Compliance(assetInfo) {
    // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0088/CIPs/0026
    var errors = [];
    const versionOfCIP = assetInfo['0'] == null ? 1 : `${assetInfo['0']}`;
    if(isNaN(versionOfCIP)) {
        errors.push("CIP 26 Optional field 0: &quot;Version&quot; is not a number");
    }

    const tokenArray = assetInfo['1'];
    if(!Array.isArray(tokenArray)) {
        errors.push("CIP 26 Required field 1: &quot;Fungible Tokens&quot; is not an array");
    }

    if(errors.length > 0) {
        // metadata not specified. No need to continue from this point
        return errors;
    }

    var tokenDetails;
    for(var i = 0; i < tokenArray.length; i++) {
        tokenDetails = tokenArray[i];

        // Validate 0. Subject
        const subject = tokenDetails['0'];
        if(subject == null) {
            errors.push(`CIP 26 Required field 1-0 (Entry ${i+1}): &quot;Subject&quot; is not present`);
        }
        else {
            errors = errors.concat(isTokenIdentifier(subject, `CIP 26 Required field 1-0 (Entry ${i+1}): &quot;Subject&quot;`));
        }

        // Validate 1. Token Name
        const tokenName = tokenDetails['1'];
        if(tokenName == null || tokenName.trim() == '') {
            errors.push(`CIP 26 Required field 1-1 (Entry ${i+1}): &quot;Token Name&quot; cannot be empty`);
        }

        // Validate 2. Description
        const description = tokenDetails['2'];
        if(!Array.isArray(description)) {
            errors.push(`CIP 26 Required field 1-2 (Entry ${i+1}): &quot;Description&quot; is not an array`);
        }

        // Validate 3: Token Ticker
        const tokenTicker = tokenDetails['3'];
        if(tokenTicker != null && tokenTicker.trim() == '') {
            errors.push(`CIP 26 Optional field 1-3 (Entry ${i+1}): &quot;Token Ticker&quot; is specified but is empty`);
        }

        // Validate 4: Token Decimals
        const decimals = tokenDetails['4'];
        if(decimals != null) {
            if(isNaN(decimals) || !Number.isInteger(decimals)) {
                errors.push(`CIP 26 Optional field 1-4 (Entry ${i+1}): &quot;Decimals&quot; is specified but is not a number`);
            }
        }

        // Validate 5: Token Website
        const webSite = tokenDetails['5'];
        if(webSite != null) {
            errors = errors.concat(isURIArray(webSite, `CIP 26 Optional field 1-5 (Entry ${i+1}): &quot;Token Website&quot;`));
        }

        // Validate 6: Token Image
        const image = tokenDetails['6'];
        if(image != null) {
            errors = errors.concat(isURIArray(image, `CIP 26 Optional field 1-6 (Entry ${i+1}): &quot;Token Image&quot;`));
        }

        // Validate 7: Beacon Token
        const beaconToken = tokenDetails['7'];
        if(beaconToken != null) {
            errors = errors.concat(isTokenIdentifier(beaconToken, `CIP 26 Optional field 1-7 (Entry ${i+1}): &quot;Beacon Token&quot;`));
        }
    }

    return errors;
}

function cip27Compliance(assetInfo) {
    // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0027
    var errors = [];
    var metadata = null;

    if(assetInfo.minting_tx_metadata == null) {
        errors.push("No minting tx metadata found");
    }
    else {
        metadata = assetInfo.minting_tx_metadata;
        if(metadata['777'] == null) {
            errors.push("No CIP 27 metadata specified")
        }
    }

    if(errors.length > 0) {
        // metadata not specified. No need to continue from this point
        return {errors: errors, metadata: null};
    }

    const royaltyMetadata = metadata['777'];
    const addr = royaltyMetadata['addr'];
    var royaltyRate = royaltyMetadata['rate'] != null ? royaltyMetadata['rate'] : royaltyMetadata['pct'];
    royaltyRate = parseFloat(royaltyRate)

    if(isNaN(royaltyRate) || royaltyRate < 0.0) {
        errors.push(`Metadata does not specify any royalty rate.`);
    }
    else if(royaltyRate > 1.0) {
        errors.push(`Metadata specifies royalty rate above 100% (1.0)`);
    }

    errors = errors.concat(
        isBech32Array(addr, "CIP 27 Required Field &quot;addr&quot;:")
    );

    if(addr.length > 2) {
        errors.push(`Royalty address list can only contain one bech32 address`);
    }

    return {errors: errors, metadata: royaltyMetadata};
}

function cip88Ext_27Compliance(assetInfo) {
    // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0088/CIPs/0027
    var errors = [];
    const versionOfCIP = assetInfo['0'] == null ? 1 : `${assetInfo['0']}`;
    if(isNaN(versionOfCIP)) {
        errors.push("CIP 27 Optional field 0: &quot;Version&quot; is not a number");
    }

    const royaltyDetails = assetInfo['1'];
    //console.log('royaltyDetails', royaltyDetails);
    if(royaltyDetails == null) {
        errors.push("CIP 27 Required field 1: &quot;Royalty Details&quot; missing");
        return errors;
    }
    
    if(royaltyDetails['0'] == null) {
        errors.push("CIP 27 Required field 1-0: &quot;Rate&quot; missing");
    }
    else {
        const rate = parseFloat(royaltyDetails['0']);
        if(isNaN(rate)) {
            errors.push("CIP 27 Required field 1-0: &quot;Rate&quot; is not a number");
        }
        else if(rate < 0.0 || rate > 1.0) {
            errors.push("CIP 27 Required field 1-0: &quot;Rate&quot; must be floating point number between 0.0 and 1.0");
        }
    }

    if(royaltyDetails['1'] == null) {
        errors.push("CIP 27 Required field 1-1: &quot;Recipient Address&quot; missing");
    }
    else {
        const addrArray = royaltyDetails['1'];
        if(!Array.isArray(addrArray)) {
            errors.push("CIP 27 Required field 1-1: &quot;Recipient Address&quot; is not an array");
        }
        else {
            const recipient = addrArray.join('');
            const index = recipient.lastIndexOf('addr');
            if(index == -1) {
                // addr should only occur once and be the start of the recipient string
                errors.push("CIP 27 Required field 1-1: &quot;Recipient Address&quot; contains no bech32 address");
            }
            else if(index > 0) {
                errors.push("CIP 27 Required field 1-1: &quot;Recipient Address&quot; array should contain a single bech32 address");
            }
        }
    }


    return errors;
}

function cip88Ext_48Compliance(assetInfo) {
    // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0088/CIPs/0048

    // TODO: The documentation is currently too shallow to be implemented
    return [];
}

function cip88Ext_60Compliance(assetInfo) {
    // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0088/CIPs/0060

    // TODO: The documentation is currently too shallow to be implemented
    return [];
}

function cip88Ext_68Compliance(assetInfo) {
    // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0088/CIPs/0068

    // TODO: When first reading through this documentation it looks identical to the specification of CIP 25 Project Information.
    // Until further investigation, simply reuse the cip 25 compliance function also for cip 68 metadata when cip 88 is used
    return cip88Ext_25Compliance(assetInfo);

}

function cip88Ext_86Compliance(assetInfo) {
    // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0088/CIPs/0086

    // TODO: 
    return [];
}

function cip88Ext_102Compliance(assetInfo) {
    // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0088/CIPs/0102

    // TODO: 
    return [];
}


async function cip88Compliance(assetInfo) {
    // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0088
    
    var errors = [];

    // This project has for now placed the cip88 certificate in a similar location as koios api does for cip 68 metadata.
    // This might change in the future when support for cip 88 is added to Koios.
    const cip88Certificate = assetInfo['cip88_metadata'];
    if(cip88Certificate == null) {
        errors.push("No CIP 88 metadata specified")
    } 

    if(errors.length > 0) {
        // metadata not specified. No need to continue from this point
        return {errors: errors, metadata: null};
    }
    
    // CIPs supported by CIP 88. Used in '2 Feature Set' and '6 CIP-Specific Information'
    const cipValidationFunctions = {
        25: cip88Ext_25Compliance,
        26: cip88Ext_26Compliance,
        27: cip88Ext_27Compliance,
        48: cip88Ext_48Compliance,
        60: cip88Ext_60Compliance,
        68: cip88Ext_68Compliance,
        86: cip88Ext_86Compliance,
        102: cip88Ext_102Compliance
    }

    if(errors.length > 0) {
        // metadata not specified. No need to continue from this point
        return {errors: errors, metadata: null};
    }

    if(cip88Certificate['0'] == null) {
        errors.push("Version element missing");
    }
    if(cip88Certificate['1'] == null) {
        errors.push("Registration payload element missing");
    }
    if(cip88Certificate['2'] == null) {
        errors.push("Registration witness element missing");
    }

    if(errors.length > 0) {
        // basic required elements missing. No need to continue from this point
        return {errors: errors, metadata: cip88Certificate};
    }

    const regPayload = cip88Certificate['1'];
    const requiredRegPayloadFields = ['1','2','3','4'];
    requiredRegPayloadFields.forEach((fieldName) => {
        if(!regPayload.hasOwnProperty(fieldName)) {
            errors.push(`Required field ${fieldName} of CIP88 Registration Payload not present`);
        }
    });

    // Validate 1. Scope
    // currently only ID = 0 is defined by the CIP. Namely "Native scripts"
    const scope = regPayload['1'];
    if(scope.length != 3) {
        errors.push(`Registration Payload, &quot;1. Scope&quot; shall contain 3 elements`);
    }
    else {
        if( scope[0] == '0') {
            // this is a Native script
            const policyID = scope[1]
            if(!isHex(policyID, 56)) {
                errors.push(`Registration Payload, &quot;1. Scope&quot; Policy id invalid`);
            }
            const policyScriptHex = scope[2].join('');
            if(!isHex(policyScriptHex)) {
                errors.push(`Registration Payload, &quot;1. Scope&quot; Policy script hex invalid`);
            }

            // will not do any more than format verification at this point
        }
        else {
            // This type is not defined
            errors.push(`Registration Payload, &quot;1. Scope&quot; type ${scope[0]} is not supported by CIP 88`);
        }
    }
    
    // Validate 2. Feature Set
    const featureSet = regPayload['2'];
    if(!Array.isArray(featureSet)) {
        errors.push(`Registration Payload, &quot;2. Feature Set&quot; shall be a list/array of unsigned integers`);
    }
    else {
        // feature set is an array. Validate the elements
        featureSet.forEach((cip) => {
            if(isNaN(cip)) {
                errors.push(`Registration Payload, &quot;2. Feature Set&quot;: ${cip} is not an unsigned integer`);
            }

            if(!cipValidationFunctions.hasOwnProperty(cip)) {
                errors.push(`Registration Payload, &quot;2. Feature Set&quot;: ${cip} is not a supported CIP`);
            }
        });
    }

    // Validate 3. Validation Method
    const validationMethod = regPayload['3'];
    if(!Array.isArray(validationMethod)) {
        errors.push(`Registration Payload, &quot;3. Validation Method&quot; shall be a list/array`);
    }
    else {
        // validation method is an array. Validate the elements
        if(validationMethod[0] == 0) {
            // validation method == Ed25519 Key Signature

            //TODO: Verify that the witness signature is produced by signing the hex-encoded CBOR representation of the Registration Payload object 
        }
        else if(validationMethod[0] == 1) {
            // validation method == Beacon/Reference Token
            const beaconReferenceToken = validationMethod[1];
            errors = errors.concat(isTokenIdentifier(beaconReferenceToken, "Registration Payload, &quot;3. Validation Method&quot; Beacon/Reference Token"));
        }
        else {
            errors.push(`Registration Payload, &quot;3. Validation Method&quot; ${validationMethod[0]} is not supported`);
        }
    }

    // Validate 4. Nonce
    const nonce = regPayload['4'];
    if(isNaN(nonce)) {
        errors.push(`Registration Payload, &quot;4. Nonce&quot; ${nonce} is not a valid number`);
    }

    // Validate 5. Data Oracle URI
    const dataOracleURI = regPayload['5'];
    if(dataOracleURI != null) {
        // the optional Data Oracle URI field has been provided
        if(!Array.isArray(dataOracleURI)) {
            errors.push(`Registration Payload, &quot;5. Data Oracle URI&quot; is not a list/array`);
        }
        else {
            const url = dataOracleURI.join('');
            if(!isValidUrl(url)) {
                errors.push(`Registration Payload, &quot;5. Data Oracle URI&quot; contains an invalid URL`);
            }
        }
    }

    // Validate 6. CIP-Specific Information
    const cipInfo = regPayload['6'];
    if(cipInfo != null) {
        // the optional CIP-Specific Information field has been provided
        Object.keys(cipInfo).forEach((cip) => {
            const complianceFunction = cipValidationFunctions[cip];
            if(complianceFunction != null) {
                // TODO: Currently only the errors are kept...see if this is good enough
                errors = errors.concat(
                    complianceFunction(cipInfo[cip])/*.errors*/
                    );
            }
            else {
                errors.push(`Registration Payload, &quot;6. CIP-Specific Information&quot; refers to the unsupported cip ${cip}`);
            }
        });
    }

    const regWitness = cip88Certificate['2'];
    if(regWitness.length == 0) {
        errors.push(`No CIP88 Registration Witnesses present`);
        return {errors: errors, metadata: cip88Certificate};
    }
    
    var witness;
    // witness should be of length 3 as index 0 is public key and index 1 and 2 concatenated is the signature
    for(var i = 0; i < regWitness.length; i++) {
        witness = regWitness[i];
        if(witness.length != 3) {
            errors.push(`Registration Witness ${i} incomplete`);
        }

        var invalidHexFound = false;
        for(var j = 0; j < witness.length; j++) {
            if(!isHex(witness[j], 64)) {
                invalidHexFound = true;
                break;
            }
        }

        if(invalidHexFound) {
            errors.push(`Registration Witness ${i} has wrong format`);
        }
    }

    if( scope[0] == '0') {
        // verify that policy script hex cbor is correctly representing the policy id 
        await verifyCIP88Cert(regPayload, regWitness).then((report) => {
        
            if(!report.policyIdMatch) {
                errors.push(`Registration Payload, &quot;1. Scope&quot; Policy id script doesn't match provided script`);
            }

            var witness;
            for(var y = 0; y < report.witnessValidation.length; y++) {
                witness = report.witnessValidation[y];
                if(!witness.requiredSigner) {
                    errors.push(`Registration Witness ${y} is not a required signer of the provided script`);
                }
                if(!witness.witnessSignatureValid) {
                    errors.push(`Registration Witness ${y} Signature is invalid`);
                }
            }
        });
    }
    else {
        // not native script. CIP 88 currently only support native scripts witnesses
        errors.push(`Registration Payload, &quot;1. Scope&quot; Type = ${scope[0]}. Currently only type = 0 (native script) is supported`);
    }
    
    return {errors: errors, metadata: cip88Certificate};
}

function isLettersAndNumbers(valueToCheck) {
    var regEx = `^[0-9a-zA-Z]*$`;
    var hash_test = valueToCheck.match(regEx);
    if(hash_test === null) {
      return false;
    } 
  
    return true;
}

function isHex(valueToCheck, length) {
    var hexRegEx = `^[0-9a-fA-F]{${length}}$`;

    if(length == undefined) {
        hexRegEx = '^[0-9a-fA-F]+$'; // do variable char length test
    }
    
    var tmp = valueToCheck;
    if(valueToCheck.indexOf('0x') == 0) {
      tmp = valueToCheck.substring(2)
    }
  
    var hash_test = tmp.match(hexRegEx);
    if(hash_test === null) {
      return false;
    } 
  
    return true;
  }
  

async function verifyCIPCompliance(assetInfo, cip27Asset, cip68RefTokens, checkCIPs) {
    
    const cipCompliance = {};

    if(checkCIPs.includes(88)) {
        cipCompliance[88] = await cip88Compliance(assetInfo);
    }
    
    if(checkCIPs.includes(25)) {
        cipCompliance[25] = cip25Compliance(assetInfo);
    }
    
    if(checkCIPs.includes(27)) {
        if(cip27Asset != null) {
            cipCompliance[27] = cip27Compliance(cip27Asset);
        }
        else if(cipCompliance[88] != null) {
            if(cipCompliance[88].metadata != null) {
                // this is a CIP 88 NFT. Check compliance of royalty CIP 27 metadata defined in cip 88 metadata
                const cip88Payload = cipCompliance[88].metadata['1'];
                if(!cip88Payload['2'].includes(27)) {
                    cipCompliance[27] = {errors: ["No CIP 27 metadata specified"], metadata: null};
                }
                else {
                    const cipDetails = cip88Payload['6'];
                    cipCompliance[27] = {errors: cip88Ext_27Compliance(cipDetails['27']), metadata: cipDetails['27']};
                }
            }
        }
        else {
            cipCompliance[27] = {errors: ["No CIP 27 metadata specified"], metadata: null};
        }
        
    }

    if(checkCIPs.includes(68)) {
        cipCompliance[68] = cip68Compliance(assetInfo, cip68RefTokens);
    }

    return cipCompliance;
}

var numAssetFields = 0;

function setFieldInactive(fieldNumber) {
    document.getElementById(`inputgroup_${fieldNumber}`).classList.add('inactive');
    document.getElementById(`assetnameInput_${fieldNumber}`).classList.add('inactive');
    document.getElementById(`dummyInput_${fieldNumber}`).classList.add('inactive');
}

function setFieldActive(fieldNumber) {
    document.getElementById(`inputgroup_${fieldNumber}`).classList.remove('inactive');
    document.getElementById(`assetnameInput_${fieldNumber}`).classList.remove('inactive');
    document.getElementById(`dummyInput_${fieldNumber}`).classList.remove('inactive');
}

function addAssetNameField(themeclass, elemid) {
    numAssetFields++;
    var inputFieldHTML = `<div id="inputgroup_${numAssetFields}" class="input-group ${themeclass} mb-3">
    <input type="text" id="assetnameInput_${numAssetFields}" class="form-control" placeholder="ASSET NAME ${numAssetFields}" aria-label="ASSET NAME ${numAssetFields}" aria-describedby="basic-addon2">
    <span id="dummyInput_${numAssetFields}" class="dummy_field_input padding material-symbols-outlined">
        search
    </span>
    </div>`;
    
    document.getElementById(elemid).innerHTML += inputFieldHTML; 
    
    const newInputField = document.getElementById(`assetnameInput_${numAssetFields}`);
    newInputField.addEventListener("focusout", (event) => {
        if(event.target.value.length >= 1) {
            
            const existingAssetNameFields = document.querySelectorAll(`[id^="assetnameInput_"]`);
            // since we are rebuilding the HTML, we need to save the values 
            const values = {};
            existingAssetNameFields.forEach((userItem) => {
                values[userItem.id] = document.getElementById(userItem.id).value;
            });

            // adding the new field to the HTML
            addAssetNameField(`${themeclass}`, `${elemid}`);
            setFieldInactive(`${numAssetFields}`);

            // reseting values now that the HTML has been rebuilt
            Object.keys(values).forEach((fieldId) => {
                document.getElementById(fieldId).value = values[fieldId];
            })
        }
    });
    newInputField.addEventListener("focus", (event) => {
        setFieldActive(`${numAssetFields}`)
    });
    // newInputField.addEventListener("input", (event) => {
    //     console.log('input event '+ event.target.value);
    //     if(event.target.value.length >= 1) {
    //         // user has input something in the asset name field. Add one additional field
    //         addAssetNameField(`${themeclass}`, `${elemid}`);
    //     }
    // });
    
}

try {
    module.exports = {
        isHex: isHex,
        decodeObject: decodeObject,
        isObject: isObject
    };
}
catch(err) {}