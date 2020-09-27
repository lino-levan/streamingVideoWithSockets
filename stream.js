//options
var resolution = [2560,1080];
var modes = [];//Possible are: screen, control, webcam
var clientPort = 9995;
var controlPort = 9994;
var fps = 10;

//use dependencies
var screenshot = require('screenshot-desktop');
const Canvas = require('canvas')
const canvas = Canvas.createCanvas(resolution[0],resolution[1]);
const ctx = canvas.getContext('2d');
const Datauri = require('datauri');
const datauri = new Datauri();
const Image = Canvas.Image;
const robot = require("robotjs");
robot.setMouseDelay(2);
const clipboardy = require('clipboardy');
const looksSame = require('looks-same');
const portAudio = require('naudiodon');

//webserver
const express = require('express');

//client webserver
const app = express();
const http = require('http').createServer(app);
const fs = require('fs');
const io = require('socket.io')(http);

app.use(express.static('client'));

//utility functions
function checkPermissions(perm, callback){
  if(modes.includes(perm)){
    callback();
  }
}

function sendData(){
  checkPermissions("screen",()=>{
    screenshot().then((img) => {
      datauri.format(".png",img)
      io.emit('getScreen',datauri.content)
    });
  });
  setTimeout(sendData,1000/fps);
}
sendData();

io.on('connection', (sock) => {
  console.log("connect");
  sock.emit('screenSize',robot.getScreenSize())
  sock.on('disconnect', ()=>{
    console.log("disconnect");
  });
  sock.on('setMouse', (input)=>{
    checkPermissions("control",()=>{
      robot.moveMouse(input.x, input.y);
    });
  });
  sock.on('mouseToggle', (type,button)=>{
    checkPermissions("control",()=>{
      robot.mouseToggle(type,button);
    });
  });
  sock.on('mouseScroll', (x,y)=>{
    checkPermissions("control",()=>{
      robot.scrollMouse(x,y);
    });
  });
  sock.on('keyToggle', (x,y,m)=>{
    checkPermissions("control",()=>{
      try{
        for(let i =0;i<m.length;i++){
          robot.keyToggle(m[i],"down");
          console.log(m[i])
        }
        robot.keyToggle(x,y);
        for(let i =0;i<m.length;i++){
          robot.keyToggle(m[i],"up");
        }
      }
      catch(err){}
    });
  });
});

http.listen(clientPort, function(){
  console.log('listening on *:'+clientPort);
});

//control webserver
const appC = express();
const httpC = require('http').createServer(appC);
const fsC = require('fs');
const ioC = require('socket.io')(httpC);

appC.use(express.static('control'));

ioC.on('connection', (sock) => {
  console.log("Loaded Control Panel");
  sock.on('setOption', (ops)=>{
    modes=ops;
  });
});

httpC.listen(controlPort, function(){
  console.log('listening on *:'+controlPort);
});

//open control panel
var url = 'http://localhost:'+controlPort;
var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
require('child_process').exec(start + ' ' + url);
