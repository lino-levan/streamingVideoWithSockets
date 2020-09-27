var socket = io();
var options = []

function switchTheme(){
  if(document.body.className==="lightMode"){
    document.body.className="darkMode";
  }else{
    document.body.className="lightMode";
  }
}

function setOption(option,id){
  if(options.includes(option)){
    options=options.filter((value)=>{return value!==option});
    document.getElementById(id).getElementsByTagName("span")[0].style.color="red";
  }else{
    options.push(option);
    document.getElementById(id).getElementsByTagName("span")[0].style.color="green";
  }
  socket.emit('setOption',options);
}
