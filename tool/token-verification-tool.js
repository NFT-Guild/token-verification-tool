var createError = require('http-errors');
const express = require('express');
var path = require('path');
var fs = require('fs');
var https = require('https');
var bodyParser = require('body-parser');

var privateKey = fs.readFileSync('./keys/cent.key', 'utf8');
var certificate = fs.readFileSync('./keys/cent.pem', 'utf8');

var credentials = { key: privateKey, cert: certificate };

var indexRouter = require('./src/routes/index');
var apiTxStatusRouter = require('./src/routes/api_tx_status');
var apiAssetInfoRouter = require('./src/routes/api_asset_info');

const app = express()
app.use(bodyParser.json());

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(11451);

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/api_tx_status', apiTxStatusRouter);
app.use('/api_asset_info', apiAssetInfoRouter);

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

////////////////////////////////////////////
// KOIOS MAINNET / PREPROD SETTING - CHANGE TO YOUR DESIRED ENVIRONMENT
//const koios_api_url = 'https://api.koios.rest/api/v1'; // mainnet
const koios_api_url = 'https://preprod.koios.rest/api/v1'; // preproduction
app.set('koios_api_url', koios_api_url);

module.exports = app;
