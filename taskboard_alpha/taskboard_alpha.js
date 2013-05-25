// globale Var
  var task_width = 200, task_height = 100;
// Position der SVG im Browser
  var tbX,tbY;
// Abstand nach rechts/unter
  var spaceR = 30;
  var spaceB = 10;
// Hilfsvariablen fuer DandD
  var mTask, oldX, oldY;
  
// Timervariablen
  var bClick = 0;
  var interval;


function setTimeGraph(d,t) {
  d.percent_average_completition_time = d.percent_average_completition_time + t;
  
  if (d.percent_average_completition_time <= 1) {
   return ("0,0 0," + task_height + " " +
          (task_width * d.percent_average_completition_time) + "," + task_height)
  }
  else {
    return ("0,0 0," + task_height + " " +
           task_width + "," + task_height + " " +
           task_width + "," + (task_height - task_height*(d.percent_average_completition_time-1)) )
  }
}


function setProgressGraph(d) {
  return ("0,0 0," + task_height + " " +
         (task_width * d.percent_completed) + "," + task_height)
}


function positionUpdate(t, speed) {
  var a; // Nachfolgertask
  var d = dataset.task;
  var posX = $('#' + t.id).position().left - tbX;
  var posY = $('#' + t.id).position().top - tbY;
  
  d3.selectAll("#" + t.id)
    .transition()
    .attr("transform", "translate(" + posX + "," + (posY-task_height-spaceB) + ")")
    .duration(speed);
  
  // falls Nachfolgertask vorhanden mit nachruecken    
  if(t.after != null){
    for (var i = 0; i < d.length; i++){
      if (t.after == d[i].id) { a = d[i] }
    }
   positionUpdate(a, speed+100);
  }
}


// Tasks neu verknuepfen
// Vorgaenger und Nachfolger des Dragtasks
function stateUpdate(b,a) {
  var d = dataset.task;
  
  // keinen Nachfolger
  if(a == null){
    // aber Vorgaenger
    if(b != null){
      // id to object
      for (var i = 0; i < d.length; i++){
        if (d[i].id == b) { b = d[i]; } 
      }
    // Vorgaenger hat keinen Nachfolger mehr  
    b.after = null;
    }
  }
  // hat einen Nachfolger
  else {
    // und Vorgaenger
    if (b != null) {
      // id to object
      for (var i = 0; i < d.length; i++){
        if (d[i].id == b) { b = d[i]; }
        if (d[i].id == a) { a = d[i]; }
      }
    // verknuepfen des Tasks  
    a.before = b.id;
    b.after = a.id;  
    }
    // Nachfolger aber keinen Vorgaenger  
    else {
      // id to object
      for (var i = 0; i < d.length; i++){
        if (d[i].id == a) { a = d[i]; } 
      }
      a.before = null;
    }
  // Nachruecken um Luecke zu schliessen 
  positionUpdate(a, 500);
  } 
}


// am Begin des Drags
function start(id) {
  // Mousepos innerhalb eines Tasks  
  mTask = d3.mouse($('#' + id)[0]);
  
  // alte Position des Tasks  
  oldX = $('#' + id).position().left;
  oldY = $('#' + id).position().top;
}


// Funktion waehrend des Drags
function move(d){
  
  if (!(d.state >= 4)) {

  // Mousepos im Taskboard  
  var mTaskboard = d3.mouse($('#taskboard')[0]);
  var dragTarget = d3.select('#' + d.id);
  
  newX =(mTaskboard[0]-mTask[0]);
  newY =(mTaskboard[1]-mTask[1]);
  // neue Positon des Tasks
  dragTarget
    .attr("transform", "translate(" + newX  + "," + newY + ")");
  }
}


// Funktion beim Drop
function stop(t) {
 var posX = $('#' + t.id).position().left;
 var posY = 0;
 var d = dataset.task;
  
  // Task auf alte Position zuruecksetzen 
  if((posX < (oldX+(task_width+spaceR)-task_width/3)) || (posX > oldX+(2*task_width))){
    d3.select('#' + t.id)
      .transition()
      .attr("transform", "translate(" + (oldX-tbX) + "," + (oldY-tbY) +")")
      .duration(1000)
      .ease("elastic");
  }
  
  // Task wird innerhalb der neuen Spalte losgelassen
  else{
    // State hochsetzten
    t.state = t.state +1;
    
    // letzten Tasks der neuen Spalte finden
    for (var i = 0; i < d.length; i++) {
      if ((t.state == d[i].state) && (d[i].after == null) && (t.id != d[i].id)) {
        // Position unter den letzten Task
        posY = $('#' + d[i].id).position().top + task_height + spaceB - tbY;
        d[i].after = t.id;
        stateUpdate(t.before, t.after);
        t.before = d[i].id;
      }  
    }
    
    d3.select('#' + t.id)
      .transition()
      .attr("transform", "translate(" + (oldX+task_width+spaceR - tbX) + "," + posY +")")
      .duration(600);
    if (posY == 0) {stateUpdate(t.before, t.after); t.before = null;}  
    t.after = null;
  }
}


// Berechnung der x und y Position bezueglich des States und des Vorgaengers
var position = function(state, before){
  var y, x;
  x = state*(task_width + spaceR);
  
  if (before == null) { y = 0; }
  else {
    y = $('#' + before).position().top + task_height + spaceB - tbY;
  } 
  return "translate(" + x + "," + y + ")";
}


function timerTick() {
  var d = dataset.task
  
  for (var i = 0; i < d.length; i++) {
    if ((d[i].state != 0) && (d[i].state != 4)) {
     if(d[i].percent_average_completition_time <= 2){
    var point = setTimeGraph(d[i], 0.01);
    d3.select('#' + d[i].id).select(".timer").transition().attr("points", point);
     }
    }
  }
}


// Button fuer Zeit ein/aus
var update = function(){
  if ((bClick%2) == 0) {
    alert("timer on");
    interval = setInterval(timerTick,1000);
  }
  else{
    clearInterval(interval);
    alert("timer off");
    }
    ++bClick;
}


// rendert alle Tasks
var renderTask = function() {
var taskboard = d3.select("#taskboard").selectAll("g")
  // Datenanbindung
  .data(dataset.task).enter()
    
    // SVG-Group
    .append("g")
    .attr("id" , function(d){return d.id})
    .attr("transform", function(d){return position(d.state, d.before)})    
    // Drag and Drop Event
    .call(d3.behavior.drag()
    .on("dragstart", function(d){start(d.id)})     
    .on("drag", function(d){move(d)})
    .on("dragend", function(d){stop(d)}));
    
    // Rechteck  
    taskboard.append("rect")
      .attr("height", task_height)
      .attr("width", task_width)
      .attr("fill", "#f0f0f0");
      
    // Zeitgraph
    taskboard.append("polygon")
      .attr("points", function(d){ return setTimeGraph(d,0) })
      .style("fill", "red")
      .attr("class", "timer");
      
    // Fortschrittsgraph  
    taskboard.append("polygon")
      .attr("points", function(d){ return setProgressGraph(d) })
      .style("fill", "#00a99d");
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
  }
}



////// SERVER
if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
}
