// https://www.tutorialspoint.com/socket.io/socket.io_chat_application.htm

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
   res.sendfile('index.html');
});


let roomNo = 1;

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
   console.log('A user connected');
   clientNum++;
   // io.sockets.emit('broadcast', {desc: clientNum + " clients connected currently!"}); this function would even send to the sender, to avoid that use:
   socket.emit('allButSender', {desc: "Whale Cum!... get it?"});
   
   if(io.nsps['/'].adapter.rooms["room-"+roomNo] && io.nsps['/'].adapter.rooms["room-"+roomNo].length  > 1){
      roomNo++;
   }
   socket.join("room-"+roomNo);
   console.log("sending room info");
   
   io.sockets.in('room-'+roomNo).emit('connectToRoom', {desc: `You are in room num: ${roomNo}`});
   
   setTimeout(function(){
      io.sockets.in('room-'+roomNo).emit('connectToRoom', {desc: `Disconnecting you from the room: ${roomNo}`});
      socket.leave("room-"+roomNo);
   }, 4000);
   
   socket.broadcast.emit('allButSender', {desc: "Another user has joined!"});
   
   // setTimeout(function() {
   //    console.log(`Sending event to client`);
   //    socket.emit('testEvent', {description: "A custom event Dan made!"});
   // }, 2000);
   
   socket.on('testResponse', function(data){
      console.log(`The client return the message: "${data.desc}"!`);
   });

   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      console.log('A user disconnected');
      clientNum--; // this does no protect against spamming refresh lol
      socket.broadcast.emit('allButSender', {desc: "A user has left!"});
   });
});



app.get('/newSpace', function(req, res) {
   res.sendfile('index2.html');
});

let newSpace = io.of('/newSpace');
newSpace.on('connection', function(socket) {
   console.log('A user connected');
   clientNum++;
   // io.sockets.emit('broadcast', {desc: clientNum + " clients connected currently!"}); this function would even send to the sender, to avoid that use:
   socket.emit('allButSender', {desc: "THIS IS NEW HAHAHAH"});
   socket.broadcast.emit('allButSender', {desc: "Another user has joined!"});
   
   //Send a message after a timeout of 4seconds
   setTimeout(function() {
      console.log(`Sending event to client`);
      socket.emit('testEvent', {description: "A custom event Dan made!"});
   }, 2000);
   
   socket.on('testResponse', function(data){
      console.log(`The client return the message: "${data.desc}"!`);
   });

   //Whenever someone disconnects this piece of code executed
   socket.on('disconnect', function () {
      console.log('A user disconnected');
      clientNum--; // this does no protect against spamming refresh lol
      socket.broadcast.emit('allButSender', {desc: "A user has left!"});
   });
});


let userList = [];
let clientNum = 0;
let chatHistory = [];

app.get("/chat", function(req,res){
   res.sendfile("index3.html");
});

let chatSpace = io.of('/chat');

chatSpace.on('connection', function(socket){
   console.log("User connected");
   
   socket.on('setUsr', function(data){
      if(userList.indexOf(data) == -1){
         console.log(`Added user: ${data}`);
         userList.push(data);
         socket.emit('userSet', {username: data});
         socket.emit('giveHistory', chatHistory);
      } else {
         socket.emit('userExists', `The username: ${data} is taken, sorry!`);
      }
   });
   
   // lets just send the chat history
   
   
   socket.on('msg', function(data){
      console.log(`Recieved new message: "${data.message}" from: ${data.user}`);
      chatHistory.push(data);
      chatSpace.emit('newMsg', data);
   });
   
   //on client disconnect we can fire a checking event to see who is still here
   
   
   
});

http.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = http.address();
  console.log("Listening at", addr.address + ":" + addr.port);
});
