var createError = require('http-errors');
const express = require('express');
var path = require('path');
var fs = require('fs');
var https = require('https');
var bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

var privateKey = fs.readFileSync('./keys/cent.key', 'utf8');
var certificate = fs.readFileSync('./keys/cent.pem', 'utf8');

var credentials = { key: privateKey, cert: certificate };

var indexRouter = require('./src/routes/index');
var aboutRouter = require('./src/routes/about');
var apiTxStatusRouter = require('./src/koios_api/api_tx_status');
var apiAssetInfoRouter = require('./src/koios_api/api_asset_info');
var apiAssetByFingerprintRouter = require('./src/scan_api/api_asset_by_fingerprint');
var apiComplianceCheckCIP25Router = require('./src/public_api/check_cip25_compliance');
var apiComplianceCheckCIP27Router = require('./src/public_api/check_cip27_compliance');
var apiComplianceCheckCIP68Router = require('./src/public_api/check_cip68_compliance');
var apiComplianceCheckCIP88Router = require('./src/public_api/check_cip88_compliance');
var apiCIP88CertificateRouter = require('./src/public_api/get_cip88_certificate');
var apiCIP88VerificationRouter = require('./src/public_api/verify_cip88_certificate');

const app = express()
app.use(bodyParser.json());

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NFT Verification API',
            version: '0.2.0',
            description: 'API functions relevant to the different NFT related standards in the Cardano ecosystem that help you verify NFT standard compliance'
        },
        servers: [
            {
                url: 'https://bi-preprod.stakepoolcentral.com:11451/' 
            },
            {
                url: 'https://bi.stakepoolcentral.com:11451/' 
            },
            {
                url: 'https://verify.nft-guild.io/' 
            }
        ]
    },
    apis: ['./src/public_api/*.js']
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(11451);

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/api_tx_status', apiTxStatusRouter);
app.use('/api_asset_info', apiAssetInfoRouter);
app.use('/api_asset_by_fingerprint', apiAssetByFingerprintRouter);
app.use('/check_cip25_compliance', apiComplianceCheckCIP25Router);
app.use('/check_cip27_compliance', apiComplianceCheckCIP27Router);
app.use('/check_cip68_compliance', apiComplianceCheckCIP68Router);
app.use('/check_cip88_compliance', apiComplianceCheckCIP88Router);
app.use('/get_cip88_certificate', apiCIP88CertificateRouter);
app.use('/verify_cip88_certificate', apiCIP88VerificationRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.set('navWebpage', 'https://www.nft-guild.io/'); // change to the full address of your web site, example: https://www.nft-guild.io/
app.set('navTwitter', 'https://twitter.com/the_nft_guild'); // change to the full address of your twitter page, https://twitter.com/yourprofile
app.set('navDiscord', 'https://discord.gg/7HCxDryPHk'); // change to the full address of your Discord server, https://discord.gg/serverid


////////////////////////////////////////////
// LIGHT / DARK MODE SETTINGS
app.set('verification_tool_theme', 'dark-mode')
//app.set('verification_tool_theme', 'light-mode')
////////////////////////////////////////////

////////////////////////////////////////////
// KOIOS MAINNET / PREPROD SETTING - CHANGE TO YOUR DESIRED ENVIRONMENT
const koios_api_url = 'https://api.koios.rest/api/v1'; // mainnet
// const koios_api_url = 'https://preprod.koios.rest/api/v1'; // preproduction
app.set('koios_api_url', koios_api_url);
////////////////////////////////////////////

////////////////////////////////////////////
// CARDANOSCAN API
const scan_api_url = 'https://api.cardanoscan.io/api/v1/'; // mainnet
app.set('scan_api_url', scan_api_url);
////////////////////////////////////////////

////////////////////////////////////////////
// KUPO - CHANGE TO YOUR DESIRED ENVIRONMENT
const kupo_url = 'http://127.0.0.1:1442';
app.set('kupo_url', kupo_url);
////////////////////////////////////////////

module.exports = app;
