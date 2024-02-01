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

