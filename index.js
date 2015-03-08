var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = {};
var screens = {};
var pixels = [];

var id = 0;

app.get('/', function(req, res){
  	res.sendfile('index.html');
});

app.get('/admin', function(req, res){
  	res.sendfile('admin.html');
});

io.on('connection', function(socket){
	console.log(socket.id)
	if (!(socket.id in clients)) {
		id++;
  		console.log('CONNECTION #'+id);
  		clients[socket.id] = {'socket':socket, 'id':id};
	}
	else {
		console.log('EXISTING CONNECTION #'+clients[socket.id]['id']);
		clients[socket.id]['socket'] = socket;
	}
	clients[socket.id]['socket'].emit('id_assigned', clients[socket.id]['id']);

	socket.on('crowd_info', function(msg) {
		screens[msg['id']] = msg;
	});

	socket.on('admin_connected', function(msg) {
		var row = 0;
		var col = 0;
		var current = -1;
		top_left = null;
		for (var index in screens) {
    		if (!screens.hasOwnProperty(index)) {
        		continue;
    		}
    		if (screens[index]['back'] == 0 && screens[index]['right'] == 0) {
    			top_left = index;
    		}
		}
		for (var index in screens) {
    		if (!screens.hasOwnProperty(index)) {
        		continue;
    		}
    		if (current == -1) {
    			current = parseInt(top_left);
    		} else {current = screens[current]['front'];}
    		if (current != null && current != 0) {
    			pixels[row] = [current];
    			row++;
    		}
		}
		for (var index in screens) {
		    if (!screens.hasOwnProperty(index)) {
        		continue;
    		}
			for (var row in pixels) {
    			if (!pixels.hasOwnProperty(row)) {
        			continue;
    			}
				for (var index_ in screens) {
    				if (!screens.hasOwnProperty(index_)) {
        				continue;
    				}
    				if (screens[pixels[row][pixels[row].length-1]]['left'] == screens[index_]['id']) {
    					pixels[row][pixels[row].length] = screens[index_]['id'];
    				}
				}
			}
		}

		function triggerById(id, color) {
			for (var index in screens) {
    			if (!screens.hasOwnProperty(index)) {
        			continue;
    			}
    			if (screens[index]['id'] == id) {
    				screens[index]['socket'].emit('color_assigned', color);
    			}
			}
			return true;
		}

		console.log(pixels);
	});
});

http.listen(3000, function(){
  	console.log('listening on *:3000');
});