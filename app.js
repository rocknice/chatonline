var express = require('express');
var app = express();
var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
// var server = require('http').createServer(app);
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
// var index = require('./routes/index');
// var users = require('./routes/users');

//设置路由
app.set('port', process.env.PORT || 3001);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
// 	extended: false
// }));
// app.use(cookieParser());
//设置静态资源路径
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
let c = {
	count: 0
}

//WebSocket连接监听
io.on('connection', function(socket) {
	let client = {
		username: false,
		onlineCount: c.count
	}
	socket.emit('open'); //通知客户端已连接
	//对message事件的监听
	socket.on('login', function(data) {
		c.count += 1;
		client.username = data.username;
		data.onlineCount = c.count;
		client.onlineCount = c.count;
		console.log('客户端发来服务器用户信息', data);
		// socket.name = msg.userid;
		// if (!onlineUsers.hasOwnProperty(msg.userid)) {
		// 	onlineUsers[msg.userid] = msg.username;
		// 	//在线人数+1
		// 	onlineCount++;
		// 	chatUsers[onlineCount] = socket;
		// }
		//给客户端发送消息
		socket.emit('login', data);
		//广播向其他用户发消息
		socket.broadcast.emit('login', data);

	});
	socket.on('message', function(msg) {
		// console.log('客户端的对话', msg);
		// socket.name = msg.userid;
		// if (!onlineUsers.hasOwnProperty(msg.userid)) {
		// 	onlineUsers[msg.userid] = msg.username;
		// 	//在线人数+1
		// 	onlineCount++;
		// 	chatUsers[onlineCount] = socket;
		// }
		//给客户端发送消息
		socket.emit('message', msg);
		//广播向所有用户发消息
		socket.broadcast.emit('message', msg);

	});
	socket.on('disconnect', function() {
		// let data = client;
		console.log("服务器断开啦");
		if (client.username && client.onlineCount) {
			c.count -= 1;
			client.onlineCount = c.count;
			console.log(client);
			socket.broadcast.emit('logout', client);
		}
		// let name = data.username;
		// console.log(name);
	});
	//监听退出事件
	// socket.on('logout', function(o) {

	// })
	// io.on('disconnect', function(socket) {
	// 	socket.on('login', function(data) {
	// 		console.log('客户端发来的名字', data.username);
	// 		// socket.name = msg.userid;
	// 		// if (!onlineUsers.hasOwnProperty(msg.userid)) {
	// 		// 	onlineUsers[msg.userid] = msg.username;
	// 		// 	//在线人数+1
	// 		// 	onlineCount++;
	// 		// 	chatUsers[onlineCount] = socket;
	// 		// }
	// 		//给客户端发送消息
	// 		socket.emit('logout', data);
	// 		//广播向其他用户发消息
	// 		socket.broadcast.emit('logout', data);
	// 	});
	// })
});

// app.use('/', index);
// app.use('/users', users);

//指定websocket的客户端的html文件
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'views/index.html'));
});


server.listen(app.get('port'), function() {
	console.log('socket server listening on port' + app.get('port'));
});


// catch 404 and forward to error handler 有404错误时返回的页面
// app.use(function(req, res, next) {
// 	var err = new Error('Not Found');
// 	err.status = 404;
// 	next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
// 	// set locals, only providing error in development
// 	res.locals.message = err.message;
// 	res.locals.error = req.app.get('env') === 'development' ? err : {};

// 	// render the error page
// 	res.status(err.status || 500);
// 	res.render('error');
// });