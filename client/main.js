var socket = io();
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var img;
var h;
var w;

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
ctx.fillStyle="black";
ctx.fillRect(0,0,canvas.width,canvas.height);

function onPaste(info) {
  var copied = event.view.clipboardData.getData("Text");
  alert(copied);
}

socket.on('screenSize',(res)=>{
  w=res.width;
  h=res.height;
  ctx.fillStyle="white";
  ctx.strokeStyle="black";
  ctx.font = "20px sans-serif"
  ctx.lineWidth = 1;
  ctx.fillText(w+"x"+h,20,20);
  ctx.strokeText(w+"x"+h,20,20);
});

socket.on('getScreen',(res)=>{
  img = new Image();
  img.src = res;
  img.onload = ()=>{
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
  }
});

//listeners
document.addEventListener("pointermove", function(e) {
  socket.emit('setMouse',{x:(e.pageX/canvas.width)*w,y:(e.pageY/canvas.height)*h});
});

document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
});

document.addEventListener("paste", function(e) {
  console.log(e)
});

let mouseButtons = ["left","middle","right"]
document.addEventListener('mousedown', function (event) {
  socket.emit('setMouse',{x:(event.pageX/canvas.width)*w,y:(event.pageY/canvas.height)*h});
  socket.emit('mouseToggle',"down",mouseButtons[event.button]);
	event.preventDefault();
}, false);

document.addEventListener('mouseup', function (event) {
  socket.emit('mouseToggle',"up",mouseButtons[event.button]);
	event.preventDefault();
}, false);

document.addEventListener("wheel", function(e){
  console.log(e.deltaX,e.deltaY)
  socket.emit('mouseScroll',e.deltaX,e.deltaY);
});

document.addEventListener('keydown',function (e) {
  let mod = getMods(e);
  if(isValid(e)){
    if(getKey(e.key)==="v" && mod.includes("control")){
    }else{
      socket.emit('keyToggle',getKey(e.key),"down",mod);
    }
  }
  event.preventDefault();
});

document.addEventListener('keyUp',function (e) {
  let mod = getMods(e);
  if(isValid(e)){
    socket.emit('keyToggle',getKey(e.key).toLowerCase(),"up",mod);
  }
  event.preventDefault();
});

function getKey(e){
  if(e==="Backspace"){
    return "backspace";
  }else if(e.includes("Arrow")){
    return e.split("Arrow")[1].toLowerCase();
  }else if(e.length>1){
    return e.toLowerCase();
  }else{
    return e;
  }
}

function isValid(e){
  console.log(e);
  if(e.key==="Shift"){
    return false;
  }else if(e.key==="Control"){
    return false;
  }else if(e.key==="Alt"){
    return false;
  }else if(e.key==="Meta"){
    return false;
  }else{
    return true;
  }
}

function getMods(e){
  let t = [];
  if(e.shiftKey){
    t.push("shift")
  }else if(e.altKey){
    t.push("alt")
  }else if(e.ctrlKey){
    t.push("control")
  }else if(e.metaKey){
    t.push("command")
  }
  return t;
}
