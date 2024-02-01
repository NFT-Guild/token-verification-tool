var express = require('express');
var router = express.Router();

const crypto = require("crypto");

function hashTheData(algorithm, dataContent) {
  const dataBuffer = Buffer.from(dataContent);
  const shaHasher = crypto.createHash(algorithm);
  shaHasher.update(dataBuffer.toString());
  const dataHash = shaHasher.digest('hex');
  return dataHash;
}

router.post('/', function (req, res, next) {
    
  try {
    const dataToHash = req.body['data_to_hash'];
    const dataHash = hashTheData('sha256', JSON.stringify(dataToHash)); 
    
    res.json({ 
      datatohash: dataToHash, 
      datahash: dataHash 
    });
  }
  catch(err) {
    console.log('err', err);
  }

});

module.exports = router;