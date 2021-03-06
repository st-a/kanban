// globale Var
var task_width = 160, task_height = 40;

// Position der SVG im Browser
var tbX,tbY;

// Abstand nach rechts/unter
var spaceR = 30;
var spaceB = 10;
var spaceT = 40;

// Hilfsvariablen fuer DandD
var mTask, oldX, oldY;

// Timervariablen
var bClick = 0;
var interval;

//Rechteck-Variable
var Rechteck = false;

// Datenbank Objekte anlegen
Tasks = new Meteor.Collection("tasks");
Columns = new Meteor.Collection("columns");


function setTimeGraph(d,t,s) {
  d.percent_average_completition_time = d.percent_average_completition_time + t;
  
  if (Rechteck==true) {
  
    if (d.percent_average_completition_time <= 1) {
     return ("0,0 0," + task_height + " " +
            ((task_width/s) * d.percent_average_completition_time) + "," + task_height + " " +
            ((task_width/s) * d.percent_average_completition_time) + ",0")
    }
    else {
      return ("0,0 0," + task_height + " " +
             task_width/s + "," + task_height + " " +
             task_width/s + "," + 0)
    }
  }
  else{
    if (d.percent_average_completition_time <= 1) {
      return ("0,0 0," + task_height + " " +
             ((task_width/s) * d.percent_average_completition_time) + "," + task_height)
    }
    else {
      return ("0,0 0," + task_height + " " +
             task_width/s + "," + task_height + " " +
             task_width/s + "," + (task_height - task_height*(d.percent_average_completition_time-1)) )
    } 
  }
}


function setProgressGraph(d,s) {
  if (Rechteck==true) {
    return ("0,0 0," + task_height + " " +
           ((task_width/s) * d.percent_completed) + "," + task_height + " " +
           ((task_width/s) * d.percent_completed) + ",0" )
  }
  else{
    return ("0,0 0," + task_height + " " +
           ((task_width/s) * d.percent_completed) + "," + task_height)
  }
}


function update() {
  for (var i = 0; i < dataset.task.length; i++) {
    if (dataset.task[i].state < dataset.Columns.length+1) {

      if (dataset.task[i].percent_completed > dataset.task[i].percent_average_completition_time) {
        d3.select('#' + dataset.task[i].id).select(".timer").remove();
        d3.select('#' + dataset.task[i].id).insert("polygon", "line")
        .attr("class", "timer")
        .attr("points", setTimeGraph(dataset.task[i],0,1))
        .attr("fill", "#82bfbf");
      }

      if (dataset.task[i].percent_completed < dataset.task[i].percent_average_completition_time) {
        d3.select('#' + dataset.task[i].id).select(".timer").remove();
        d3.select('#' + dataset.task[i].id).insert("polygon","polygon")
        .attr("class", "timer")
        .attr("points", setTimeGraph(dataset.task[i],0,1))
        .attr("fill", "#ef3c39")
      }
    }
    
    else{
      if (dataset.task[i].percent_completed > dataset.task[i].percent_average_completition_time) {
        d3.select('#' + dataset.task[i].id).select(".timer").remove();
        d3.select('#' + dataset.task[i].id).insert("polygon", "line")
        .attr("class", "timer")
        .attr("points", setTimeGraph(dataset.task[i],0,1))
        .attr("fill", "#808080");
      }
      if (dataset.task[i].percent_completed <= dataset.task[i].percent_average_completition_time) {
        d3.select('#' + dataset.task[i].id).select(".progress")
        .attr("fill", "#808080")
      }
    }
  }
}


function positionUpdate(t, speed) {
  var a; // Nachfolgertask
  var posX = $('#' + t.id).position().left - tbX;
  var posY = $('#' + t.id).position().top - tbY;
  
  d3.selectAll("#" + t.id)
  .transition()
  .attr("transform", "translate(" + posX + "," + (posY-task_height-spaceB) + ")")
  .duration(speed);
  
  // falls Nachfolgertask vorhanden mit nachruecken    
  if(t.after != null){
    for (var i = 0; i < dataset.task.length; i++){
      if (t.after == dataset.task[i].id) { a = dataset.task[i] }
    }
    positionUpdate(a, speed+100);
  }
}


// Tasks neu verknuepfen
// Vorgaenger und Nachfolger des Dragtasks
function stateUpdate(b,a) {
  // keinen Nachfolger
  if(a == null){
    // aber Vorgaenger
    if(b != null){
      // id to object
      for (var i = 0; i < dataset.task.length; i++){
        if (dataset.task[i].id == b) { b = dataset.task[i]; } 
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
      for (var i = 0; i < dataset.task.length; i++){
        if (dataset.task[i].id == b) { b = dataset.task[i]; }
        if (dataset.task[i].id == a) { a = dataset.task[i]; }
      }
    // verknuepfen des Tasks  
    a.before = b.id;
    b.after = a.id;  
    }
    // Nachfolger aber keinen Vorgaenger  
    else {
      // id to object
      for (var i = 0; i < dataset.task.length; i++){
        if (dataset.task[i].id == a) { a = dataset.task[i]; } 
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
 var posY = spaceT;
  
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
    t.state = t.state + 1;
    // percent_completed anpassen
    t.percent_completed = (t.state - 1) / dataset.Columns.length;
    

    // letzten Tasks der neuen Spalte finden
    for (var i = 0; i < dataset.task.length; i++) {
      if ((t.state == dataset.task[i].state) && (dataset.task[i].after == null) && (t.id != dataset.task[i].id)) {
        // Position unter den letzten Task
        posY = $('#' + dataset.task[i].id).position().top + task_height + spaceB - tbY;
        dataset.task[i].after = t.id;
        stateUpdate(t.before, t.after);
        t.before = dataset.task[i].id;
      }  
    }
    
    d3.select('#' + t.id)
      .transition()
      .attr("transform", "translate(" + (oldX+task_width+spaceR - tbX) + "," + posY +")")
      //Porgress Update
      .select(".progress").attr("points", setProgressGraph(t,1))
      .duration(600);
    if (posY == spaceT) {stateUpdate(t.before, t.after); t.before = null;}  
    t.after = null;
    update();
  }
}


// Berechnung der x und y Position bezueglich des States und des Vorgaengers
var position = function(state, before){
  var y, x;
  x = state*(task_width + spaceR);
  
  if (before == null) { y = spaceT; }
  else {
    y = $('#' + before).position().top + task_height + spaceB - tbY;
  } 
  return "translate(" + x + "," + y + ")";
}


function timerTick() {
  update();
  for (var i = 0; i < dataset.task.length; i++) {
    if ((dataset.task[i].state != 0) && (dataset.task[i].state != (dataset.Columns.length+1))) {
      if(dataset.task[i].percent_average_completition_time <= 2) {
        var point = setTimeGraph(dataset.task[i], 0.01,1);
        d3.select('#' + dataset.task[i].id).select(".timer").transition().attr("points", point);
      }
    }
  }
}


// Button fuer Zeit ein/aus
var doTheClick = function() {
  if ((bClick%2) == 0) {
    alert("timer on");
    interval = setInterval(timerTick,1000);
  }
  else {
    clearInterval(interval);
    alert("timer off");
  }
  ++bClick;
}


// rendert alle Tasks
var renderTask = function() {

  // falls wir updaten, alle alten <g> loeschen
  d3.select("#taskboard").selectAll("g").remove();

  var taskboard = d3.select("#taskboard").selectAll()
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
    .attr("points", function(d){ return setTimeGraph(d,0,1) })
    .attr("fill", "#ef3c39")
    .attr("class", "timer");
    
  // Fortschrittsgraph  
  taskboard.append("polygon")
    .attr("points", function(d){ return setProgressGraph(d,1) })
    .attr("fill", "#00a99d")
    .attr("class", "progress");
    
    
}


//rendert das Taskboard
var renderTaskboard = function(){
  var dist = 0;
  var taskboard = d3.select("#taskboard")
            
  taskboard.append("text")
    .attr("x", dist)
    .attr("y", 15)
    .text("Backlog");

  dist += task_width+spaceR;

  taskboard.append("text").selectAll("tspan")
    .data(dataset.Columns)
    .enter()
    .append("tspan")
    .attr("x", function(d,i){ return(dist *(i+1))})
    .attr("y", 15)
    .text(function(d){ return d.id});
    
  taskboard.selectAll("line")
    .data(dataset.Columns)
    .enter()
    .append("line")
      .attr("x1", function(d,i){ return(dist*(i+1))})
      .attr("y1", spaceT-15)
      .attr("x2", function(d,j){ return((dist*(j+1))+task_width)})
      .attr("y2", spaceT-15);
      
        
  taskboard.append("line")
    .attr("x1", 0)
    .attr("y1", spaceT-15)
    .attr("x2", task_width)
    .attr("y2", spaceT-15);
    
  dist += (task_width+spaceR)* dataset.Columns.length;
           
  taskboard.append("text")
    .attr("x", dist)
    .attr("y", 15)
    .text("Done");
    
  taskboard.append("line")
    .attr("x1", dist)
    .attr("y1", spaceT-15)
    .attr("x2", (task_width+dist))
    .attr("y2", spaceT-15);
    
  taskboard.selectAll("g").selectAll("line").data(dataset.Columns).enter()
    .append("line")
    .attr("x1", function(d,i){return (task_width+task_width*(i-1))/dataset.Columns.length})
    .attr("y1", 0)
    .attr("x2", function(d,i){return (task_width+task_width*(i-1))/dataset.Columns.length})
    .attr("y2", task_height); 
    
  taskboard.selectAll("line")
    .attr("stroke-width", 3)
    .attr("stroke", "black");
  taskboard.selectAll("g").selectAll("line")
    .attr("stroke-width", 1)
    .attr("stroke", "#c0c0c0");
  taskboard.selectAll("text")
    .attr("font-size", "20px")
    .attr("font-family", "Helvetica")
    .attr("fill", "black");
    
  update();
}


////// CLIENT
if (Meteor.isClient) {

  Meteor.startup(function() {
    $('#timeswitch').click(doTheClick);
        $('#Dreiecke').click(function(){Rechteck = false; renderTask(); renderTaskboard();});
    $('#Rechtecke').click(function(){Rechteck = true; renderTask(); renderTaskboard();});

  });

  Template.board.rendered = function() {
     tbX = $('#taskboard').position().left;
     tbY = $('#taskboard').position().top;
     
     renderTask();
     renderTaskboard();
  }
}



////// SERVER
if (Meteor.isServer) {
  Meteor.startup(function() {

    // wenn die Datenbank leer ist, mit Beispielen fuellen
    if (Tasks.find().count() === 0 && Columns.find().count() === 0) {
      // leere Tasks anlegen
      Tasks.insert({"id":"Login", "percent_completed":0, "percent_average_completition_time":0 , "state": 0, "before":null ,"after":"Nutzersteuerung"});
      Tasks.insert({"id":"Nutzersteuerung", "percent_completed":0, "percent_average_completition_time":0, "state": 0, "before":"Login" ,"after":"Eingabe"});
      Tasks.insert({"id":"Eingabe", "percent_completed":0, "percent_average_completition_time":0, "state": 0, "before":"Nutzersteuerung" ,"after":"Management"});
      Tasks.insert({"id":"Management", "percent_completed":0, "percent_average_completition_time":0, "state": 0, "before":"Eingabe" ,"after":null});

      // Spalten anlegen
      Columns.insert({"id":"Entwerfen"});
      Columns.insert({"id":"Umsetzen"});
      Columns.insert({"id":"Ausliefern"});
    }

  });
}
