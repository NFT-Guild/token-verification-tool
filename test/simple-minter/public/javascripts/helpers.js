async function connectwallet(name) {
    const api = await window.cardano[name].enable();
}

function truncate(fullStr, strLen, separator) {
    if (fullStr.length <= strLen) return fullStr; separator = separator || '...';
    var sepLen = separator.length;
    var charsToShow = strLen - sepLen;
    var frontChars = Math.ceil(charsToShow / 2);
    var backChars = Math.floor(charsToShow / 2);
    return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
};

function showElem(elemid) {
    document.getElementById(elemid).style.display = '';
}

function hideElem(elemid) {
    document.getElementById(elemid).style.display = 'none';
}

var validatorName = '';
var validatorUTxOList = '';
var mintingStandard = '';

const CIP68METADATATEMPLATE = { 
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

function syntaxHighlight(json) {
    if (typeof json != "string") {
      json = JSON.stringify(json, null, "\t");
    }
    
    json = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function(match) {
        var cls = "number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "key";
          } else {
            cls = "string";
          }
        } else if (/true|false/.test(match)) {
          cls = "boolean";
        } else if (/null/.test(match)) {
          cls = "null";
        }
        return '<span class="' + cls + '">' + match + "</span>";
      }
    );
  }

