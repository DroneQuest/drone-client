'use strict';
var express = require('express');
var app = express();
var arDrone = require('ar-drone');

var pngStream = arDrone.createClient().getPngStream();
var lastPng;
pngStream
.on('error', console.log)
.on('data', function(pngBuffer) {
  lastPng = pngBuffer;
});
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
app.get('/', function(req, res) {
  if (!lastPng) {
    res.writeHead(503);
    res.end('Did not receive any png data yet.');
    return;
  }
  res.writeHead(200, {'Content-Type': 'image/png'});
  res.end(lastPng);
});

app.listen(8081, function() {
  console.log('Serving latest png on port 8081 ...');
});
