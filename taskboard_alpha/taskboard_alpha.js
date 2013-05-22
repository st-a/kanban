//globale Var
var task_width = 200, task_height = 100;
var tbX,tbY;

//Hilfsvariablen für DandD
var mTask, oldX, oldY;

//Button zum spielen
var update = function(){
  
  d3.selectAll("g")
    .transition()
    .attr("transform", "translate(100,100")
    .duration(1000);
    
}


function positionUpdate(t) {
  var a;
  var d = dataset.task;
  var posX = $('#' + t.id).position().left - tbX;
  var posY = $('#' + t.id).position().top;
  
  d3.selectAll("#" + t.id)
    .transition()
    .attr("transform", "translate(" + posX + "," + (posY-task_height-tbY-10) + ")")
    .duration(1000);
      
  if(t.after != null){
        for (var i = 0; i < d.length; i++){
      if (t.after == d[i].id) { a = d[i] }
      }
    positionUpdate(a);
  }
}




function stateUpdate(b,a) {
 var d = dataset.task;
  
  if (b != null) {
    for (var i = 0; i < d.length; i++){
      if (d[i].id == b) { b = d[i]; }
      if (d[i].id == a) { a = d[i]; }
    }
  
    a.before = b.id;
    b.after = a.id;
    
  }
  
  else{
    for (var i = 0; i < d.length; i++){
      if (d[i].id == a) { a = d[i]; } 
    }
    a.before = null;
  }
  positionUpdate(a);
}



//Am Begin des Drags
function start(id) {
//Mousepos innerhalb eines Tasks  
  mTask = d3.mouse($('#' + id)[0]);
  
  oldX = $('#' + id).position().left;
  oldY = $('#' + id).position().top;
}




//Funktion während des Drags
function move(id){
//Mousepos im Taskboard  
  var mTaskboard = d3.mouse($('#taskboard')[0]);
  var dragTarget = d3.select('#' + id);
  
  newX =(mTaskboard[0]-mTask[0]);
  newY =(mTaskboard[1]-mTask[1]);
  dragTarget
    .attr("transform", "translate(" + newX  + "," + newY + ")");
};





//Funktion beim Drop
function stop(t) {
 var posX = $('#' + t.id).position().left;
 var posY = 0;
 var d = dataset.task;
 var statecount = 0;
 
  if((posX < (oldX+(task_width+10)-task_width/3)) || (posX > oldX+(2*task_width))){
    d3.select('#' + t.id)
      .transition()
      .attr("transform", "translate(" + (oldX-tbX) + "," + (oldY-tbY) +")")
      .duration(1000)
      .ease("elastic");
  }
      
  
  else{
    //State hochsetzten
    t.state = t.state +1;
    
    for (var i = 0; i < d.length; i++) {   
      if ((t.state == d[i].state) && (d[i].after == null) && (t.id != d[i].id)) {
        posY = $('#' + d[i].id).position().top + task_height-tbY + 10;
        d[i].after = t.id;
        
        if(t.after != null){
          stateUpdate(t.before, t.after)
        }
        t.before = d[i].id;
      }
      if (t.state == d[i].state) {
        satecount = statecount +1;
      }
      
    }
    d3.select('#' + t.id)
      .transition()
      .attr("transform", "translate(" + (oldX+task_width+10) + "," + posY +")")
      .duration(600);
    if (posY == 0) {stateUpdate(t.before, t.after); t.before == null;}  
    t.after = null;
  }
}


//Berechnung der x und y Position bezueglich des States und des Vorgaengers
var position = function(state, before){
  var y, x;
  x = state*(task_width+20);
  
  if (before == null) { y = 0; }
  else {
    y = $('#' + before).position().top + task_height+ 10 - tbY;
  } 
  return "translate(" + x + "," + y + ")";
}

//rendert alle Tasks
var renderTask = function() {
  
//test Datenset  
var datad = [ 5, 10, 15, 20, 25 ];


d3.select("#taskboard").selectAll("g")
  //Datenanbindung
  .data(dataset.task).enter()
    
    //SVG-Group
    .append("g")
    .attr("id" , function(d){return d.id})
    .attr("transform", function(d){return position(d.state, d.before)})
    
    //Drag and Drop Event
    .call(d3.behavior.drag()
    .on("dragstart", function(d){start(d.id)})     
    .on("drag", function(d){move(d.id)})
    .on("dragend", function(d){stop(d)}))
    
    //Rechteck
    .append("rect")
    .attr("height", task_height)
    .attr("width", task_width)
    .attr("fill", "red");
}


////// CLIENT

if (Meteor.isClient) {

  Meteor.startup(function() {
    $('button').click(update);
  });
  
  Template.board.rendered = function() {
     tbX = $('#taskboard').position().left;
     tbY = $('#taskboard').position().top;
     renderTask();
  };
}

////// SERVER

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
}
  
  
