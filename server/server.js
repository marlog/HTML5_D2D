var argv = require('optimist').argv;
var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app);
var io = require('socket.io').listen(server);
var iodev = require('socket.io-client');

var fs = require('fs')

var json = JSON.parse(fs.readFileSync(argv.friends));


console.log(argv)
console.log(json)

app.use(express.static(__dirname + '/' + argv.client + '/'));
server.listen(argv.port);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/' + argv.client + '/index.html');
});


var devices = {}

var device_list=[];
for(e in json) {
    var serverUrl = 'http://'+json[e].host + ':' + json[e].port +'/net';
    var conn = iodev.connect(serverUrl);
    devices[e]={url: serverUrl, conn:conn};
    device_list.push(e);
}


var client_socket = null;

var net = io.of('/net');
net.on('connection', function (socket) {
  socket.on('send', function (p1, fn) {
        console.log('INPUT DATA2',arguments)
        client_socket.emit('get',arguments['0'])
  });
});




io.sockets.on('connection', function (socket) {
  client_socket = socket;
  socket.emit('init_devices', { devices: device_list });
  socket.on('message', function (data) {
      console.log('CLIENT DATA', data);
    devices[data.device].conn.emit('send',data.data, 
        function(resp, data){
            console.log(resp);
        });
  });
});

