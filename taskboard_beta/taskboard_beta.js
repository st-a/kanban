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

//Farben
var taskBg = "rgb(50,50,50)";
var boardColor = "#ffffff";

//Rechteck-Variable
var Rechteck = false;

// Datenbank Objekte anlegen
Tasks = new Meteor.Collection("tasks");
Columns = new Meteor.Collection("columns");

//verlaengert den Timergraphen um "time"
//erstellt verzšgerungsdreieck
var setTimeGraph = function(task,time) {
  task.percent_average_completition_time = task.percent_average_completition_time + time;
  
    if (task.percent_average_completition_time <= 1) {
      return task_width*task.percent_average_completition_time;
    }
    else {
      d3.select('#' + task.id).select(".overtime").transition()
      .attr("points", task_width + ",0 " + task_width + "," + task_height + " " + (task_width - (task_width*(task.percent_average_completition_time-1))) + "," + task_height);
      return task_width;
  }
}


var setProgressGraph = function(task) {
    return (task.progress_state-1) * (task_width/dataset.Columns.length);
}


var update = function() {
  
  for (var i = 0; i < dataset.task.length; i++) {
    //fuer alle Tasks die nicht im Backlog sind
    if (!(dataset.task[i].progress_state == 0)) {
      
      //ist der Fortschritt groesser als der Timer?
      if (((dataset.task[i].progress_state-1)/dataset.Columns.length) > dataset.task[i].percent_average_completition_time) {
        d3.select('#' + dataset.task[i].id).select(".timer").remove();
        d3.select('#' + dataset.task[i].id).insert("rect", "line")
        .attr("class", "timer")
        .attr("height", task_height)
        .attr("width", setTimeGraph(dataset.task[i],0))
        .attr("fill", "#82bfbf");
      }

      //ist der Timer groesser als der Fortschritt?
      if (((dataset.task[i].progress_state-1)/dataset.Columns.length) <= dataset.task[i].percent_average_completition_time) {
        d3.select('#' + dataset.task[i].id).select(".timer").remove();
        d3.select('#' + dataset.task[i].id).insert("rect",".progress")
          .attr("class", "timer")
          .attr("height", task_height)
          .attr("width", setTimeGraph(dataset.task[i],0))
          .attr("fill", "rgb(232,50,50)");

      }
        
      }
    }
    }
  


var positionUpdate = function(t, speed) {
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
var stateUpdate = function(b,a) {

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
var start = function(id) {
  // Mousepos innerhalb eines Tasks  
  mTask = d3.mouse($('#' + id)[0]);
  
  // alte Position des Tasks  
  oldX = $('#' + id).position().left;
  oldY = $('#' + id).position().top;
}

// Funktion waehrend des Drags
var move = function(task){
  
  if (!(task.progress_state >= dataset.Columns.length+1)) {

  // Mousepos im Taskboard  
  var mTaskboard = d3.mouse($('#taskboard')[0]);
  var dragTarget = d3.select('#' + task.id);
  
  newX =(mTaskboard[0]-mTask[0]);
  newY =(mTaskboard[1]-mTask[1]);
  // neue Positon des Tasks
  dragTarget
    .attr("transform", "translate(" + newX  + "," + newY + ")");
  }
}

// Funktion beim Drop
var stop = function(t) {
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
    t.progress_state = t.progress_state + 1;

    // letzten Tasks der neuen Spalte finden
    for (var i = 0; i < dataset.task.length; i++) {
      if ((t.progress_state == dataset.task[i].progress_state) && (dataset.task[i].after == null) && (t.id != dataset.task[i].id)) {
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
      .select(".progress").attr("width", setProgressGraph(t))
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


var timerTick = function() {
  update();
  for (var i = 0; i < dataset.task.length; i++) {
    if ((dataset.task[i].progress_state != 0) && (dataset.task[i].progress_state < (dataset.Columns.length+1))) {
      if(dataset.task[i].percent_average_completition_time <= 2) {
        var point = setTimeGraph(dataset.task[i], 0.01);
        d3.select('#' + dataset.task[i].id).select(".timer").transition().attr("width", point);
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
  .attr("transform", function(d){return position(d.progress_state, d.before)})    
  // Drag and Drop Event
  .call(d3.behavior.drag()
  .on("dragstart", function(d){start(d.id)})     
  .on("drag", function(d){move(d)})
  .on("dragend", function(d){stop(d)}));
  
  // Rechteck  
  taskboard.append("rect")
    .attr("height", task_height)
    .attr("width", task_width)
    .attr("fill", taskBg);
    
    
  // Zeitgraph
  taskboard.append("rect")
    .attr("height", task_height)
    .attr("width", function(d){ return setTimeGraph(d,0) })
    .attr("fill", "#E82E3F")
    .attr("class", "timer");
    
  // Fortschrittsgraph  
  taskboard.append("rect")
    .attr("height", task_height)
    .attr("width", function(d){ return setProgressGraph(d) })
    .attr("fill", "#00A99D")
    .attr("class", "progress");
    
  taskboard.append("polygon")
    .attr("class", "overtime")
    .attr("points", task_width + ",0 " + task_width + "," + task_height + " " + task_width + "," + task_height)
    .attr("fill", taskBg);
  
    
    
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
    .attr("stroke", boardColor);
  taskboard.selectAll("g").selectAll("line")
    .attr("stroke-width", 1)
    .attr("stroke", "#c0c0c0");
  taskboard.selectAll("text")
    .attr("font-size", "20px")
    .attr("font-family", "Helvetica")
    .attr("fill", boardColor);
    
 update();
}


////// CLIENT
if (Meteor.isClient) {

  Meteor.startup(function() {
    $('#timeswitch').click(doTheClick);
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
