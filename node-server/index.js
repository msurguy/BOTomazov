#!/usr/bin/env node

const https = require('https');

const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const pythonShell = require('python-shell');
const port = process.env.PORT || 3000;

const secureOptions = {
    key: fs.readFileSync( './makspi.key' ),
    cert: fs.readFileSync( './makspi.cert' ),
    requestCert: false,
    rejectUnauthorized: false
};

const server = https.createServer( secureOptions, app );
const socketServer = require('socket.io')(server);
const ioClient = require('socket.io-client');
const jwt = require('jsonwebtoken');
const get = require('lodash.get');
const bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.raw({ type: 'image/svg+xml', limit: '50mb' }))

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

const generateAccessToken = function(payload, secret, expiration) {
    const token = jwt.sign(payload, secret, {
        expiresIn: expiration
    });

    return token;
};

// Get secret key from the config file and generate an access token
const getUserHome = function() {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

const cncOptions = {};
cncOptions.secret = get(cncOptions, 'secret', process.env['CNCJS_SECRET']);
cncOptions.baudrate = get(cncOptions, 'baudrate', 115200);
cncOptions.socketAddress = get(cncOptions, 'socketAddress', 'localhost');
cncOptions.socketPort = get(cncOptions, 'socketPort', 8000);
cncOptions.port = get(cncOptions, 'port', '/dev/ttyUSB0');
cncOptions.controllerType = get(cncOptions, 'controllerType', 'Grbl');
cncOptions.accessTokenLifetime = get(cncOptions, 'accessTokenLifetime', '365d');

if (!cncOptions.secret) {
    const cncrc = path.resolve(getUserHome(), '.cncrc');
    try {
        const config = JSON.parse(fs.readFileSync(cncrc, 'utf8'));
        cncOptions.secret = config.secret;
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

const token = generateAccessToken({ id: '', name: 'maks' }, cncOptions.secret, cncOptions.accessTokenLifetime);
const url = 'ws://' + cncOptions.socketAddress + ':' + cncOptions.socketPort + '/?token=' + token;

socketClient = ioClient.connect('ws://' + cncOptions.socketAddress + ':' + cncOptions.socketPort, {
    'query': 'token=' + token
});

socketClient.on('connect', () => {
    console.log('Connected to ' + url);

    // Open port
    socketClient.emit('open', cncOptions.port, {
        baudrate: Number(cncOptions.baudrate),
        controllerType: cncOptions.controllerType
    });
});

socketClient.on('error', (err) => {
    console.error('Connection error.');
    if (socketClient) {
        socketClient.destroy();
        socketClient = null;
    }
});

socketClient.on('close', () => {
    console.log('Connection closed.');
    socketServer.emit('closed', 'Connection closed');
});

socketClient.on('serialport:open', function(options) {
    options = options || {};

    console.log('Connected to port "' + options.port + '" (Baud rate: ' + options.baudrate + ')');
    socketServer.emit('serialport:open', 'Connected to port "' + options.port + '" (Baud rate: ' + options.baudrate + ')');
});

socketClient.on('serialport:error', function(options) {
  console.log('Error opening serial port', options.port);
    //callback(new Error('Error opening serial port "' + options.port + '"'));
});

socketClient.on('serialport:read', function(data) {
    console.log((data || '').trim());
    socketServer.emit('serialport:read', (data || '').trim());
});

socketServer.on('connection', function(socket) {
  console.log('new connection');
  socket.emit('message', 'Connected!!!');
});

app.post('/upload', function(req, res) {
    var fs = require('fs');
    var timestamp = Date.now();
    var svgName = timestamp + ".svg";
    var svgPath = 'svg2gcode/svg_input/';
    fs.writeFile(svgPath + svgName, req.body, 'binary', function (err){
        if(err) {
            console.log(err);
            return res.status(400).send('Error uploading a file');
        }
        var options = {
          mode: 'text',
          //pythonPath: 'path/to/python',
          //pythonOptions: ['-u'],
          scriptPath: __dirname + "/svg2gcode",
          args: [svgPath + svgName]
        };

        socketClient.emit('command', cncOptions.port, 'gcode:stop', {force : true});
        socketClient.emit('command', cncOptions.port, 'gcode:unload');

        console.log("The SVG file "+ svgPath + svgName +" was saved!");

        pythonShell.run('svg2gcode.py', options, function (err, results) {
          if (err) throw err;
          // results is an array consisting of messages collected during execution
          console.log('results: %j', results);
          socketClient.emit('command', cncOptions.port, 'gcode','G0X0Y0');
          socketClient.emit('command', cncOptions.port, 'watchdir:load', timestamp + '.gcode');
          
          setTimeout(function() {
            socketClient.emit('command', cncOptions.port, 'gcode:start');
          }, 3000);


          console.log('File has been loaded!');
          res.json({path : svgPath, svgFile: svgName, gcodeFile : timestamp + '.gcode'});
        });
    });
});

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen( port, function () {
    console.log( 'Express server listening on port ' + server.address().port );
} );