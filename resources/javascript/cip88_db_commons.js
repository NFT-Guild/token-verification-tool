const sqlite3 = require('sqlite3').verbose();
const { stringify } = require('querystring');
const cip88 = require("./cip88.js");
const path = require("path");

const cip88CertificatesDbPath = path.join(__dirname, '..', `cip88Certificates.db`)

function addCertificateToDb(slot, txid, metadata) {

    const db = new sqlite3.Database(cip88CertificatesDbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) return console.error(err.message);
    });

    const policy_id = cip88.getCIP88PolicyId(metadata);
    
    const nonce = cip88.getCIP88Nonce(metadata);
        
    const metadataString = JSON.stringify(metadata);

    // insert data into table
    const insertStatement = 'INSERT INTO cip88certificates(policy_id, nonce, metadata, slot, txid) VALUES(?,?,?,?,?)';
    db.run(
        insertStatement,
        [policy_id, nonce, metadataString, slot, txid],
        (err) => {
            if (err) {
                return console.error(err.message);
            }
            
        }
        
    );
}

function handleDbError(err) {
    if(err.message.indexOf('SQLITE_ERROR: no such table') > -1) {
        console.error(`Table cip88certificates not found in ${cip88CertificatesDbPath}. Trying to create.`);
        createCIP88CertificatesTable();
    }
    else if(err.message.indexOf('SQLITE_CANTOPEN: unable to open database file') > -1) {
        console.error(`Database file ${cip88CertificatesDbPath} not found`);
    }
    else {
        console.error(`Database error ${err.message}`);
    }
}

function getCertificateFromDb(policy_id, callback) {

    const db = new sqlite3.Database(cip88CertificatesDbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) { handleDbError(err); callback(policy_id, null); }
    });

    const selectStatement = 'SELECT * FROM cip88certificates WHERE policy_id = ? ORDER BY nonce DESC';
    db.all(selectStatement, [policy_id], (err, rows) => {
        if (err) { handleDbError(err); return null; }
        if (rows.length == 0) {
            // no cip 88 certificate found for this policy id
            callback(policy_id, null);
        }
        else {
            // there is at least one certificate. Return the one with the highest nonce (first)
            const cert = rows[0];
            const metadata = JSON.parse(cert.metadata);
            callback(policy_id, { policy_id: cert.policy_id, nonce: cert.nonce, metadata: metadata });
        }

    });
}

function createCIP88CertificatesTable() {

    const db = new sqlite3.Database(cip88CertificatesDbPath, sqlite3.OPEN_READWRITE, (err) => {
        if(err) return console.error(err.message);
    });

    // create table
    sql = 'CREATE TABLE cip88certificates(id INTEGER PRIMARY KEY, policy_id, nonce INTEGER, metadata, slot, txid)';
    db.run(sql);
}

function removeCIP88CertificatesTable() {

    const db = new sqlite3.Database(cip88CertificatesDbPath, sqlite3.OPEN_READWRITE, (err) => {
        if(err) return console.error(err.message);
    });

    // drop table
    db.run('DROP TABLE cip88certificates');
}

function getNLastCertsFromDb(n, callback) {
    
    const db = new sqlite3.Database(cip88CertificatesDbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) { handleDbError(err); callback(-1); }
    });

    const selectStatement = 'SELECT * FROM cip88certificates ORDER BY slot DESC LIMIT ?';
    db.all(selectStatement, [n], (err, rows) => {
        if (err) { handleDbError(err); return null; }
        
        callback(rows);
    });
}

function getSlotOfLastCert(callback) {
    
    const db = new sqlite3.Database(cip88CertificatesDbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) { handleDbError(err); callback(-1); }
    });

    const selectStatement = 'SELECT * FROM cip88certificates ORDER BY slot DESC LIMIT 1';
    db.all(selectStatement, [], (err, rows) => {
        if (err) { handleDbError(err); return null; }
        
        if (rows.length == 0) {
            // no slot
            callback(-1);
        }
        else {
            // there is at least one certificate. Return the slot of the last one inserted
            const cert = rows[0];
            callback(cert.slot);
        }

    });
}

module.exports = {
    dbPath: cip88CertificatesDbPath,
    addCertificateToDb: addCertificateToDb,
    getCertificateFromDb: getCertificateFromDb,
    createCIP88CertificatesTable: createCIP88CertificatesTable,
    removeCIP88CertificatesTable: removeCIP88CertificatesTable,
    getSlotOfLastCert: getSlotOfLastCert,
    getNLastCertsFromDb: getNLastCertsFromDb
};