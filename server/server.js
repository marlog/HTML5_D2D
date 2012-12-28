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
app.use(express.static(__dirname + '/I2RAPI/'));
server.listen(argv.port);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/' + argv.client + '/index.html');
});


var devices = {}

var connect_obj = {reconnect:true, 'force new connection':true, 'connect timeout':''};

var device_list=[];
for(e_id in json) {
    var serverUrl = 'http://' + json[e_id].host + ':' + json[e_id].port +'/' + e_id;
    var conn = iodev.connect(serverUrl, connect_obj);
//    var conn = iodev.connect(serverUrl,{reconnect:true, 'connect timeout':500});
    devices[e_id]={url: serverUrl, conn:conn};
    device_list.push({type:'wifi', id:e_id, name:json[e_id].host});
}


var client_socket = null;

var net = io.of('/' + argv.id);
net.on('connection', function (socket) {
  socket.on('send', function (p1, fn) {
        console.log('INPUT DATA2',arguments);
        var arg = arguments['0'];
        
        client_socket.emit('get', {id: arg.id, key: arg.key, data: arg.data.data})
  });
});


io.sockets.on('connection', function (socket) {
    client_socket = socket;
    socket.on('message', function (data) {
        console.log('CLIENT DATA', data, typeof devices[data.device].conn);
        var conn = devices[data.device].conn;
        if (typeof conn  !== "undefined") {
            if (conn.socket.connected === false) {
                socket.emit('offline',{device: data.device});
            }
            else {
                console.log('Emit',conn,data)
                devices[data.device].conn.emit('send',{id: argv.id, key: data.key, data:data});
            }
        }
        else {
            socket.emit('offline',{device: data.device});
        }
  });
  
  socket.on('get_storages', function (data) {
      console.log('get_storages')
      socket.emit('init_storages', { devices: device_list });

  });
  
});

