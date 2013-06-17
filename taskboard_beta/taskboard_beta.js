// globale Var
var task_width = 140, task_height = 30;

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
var taskBg = "rgb(230,230,230)";
var boardColor = "#000000";

// Datenbank Objekte anlegen
Tasks = new Meteor.Collection("tasks");
Columns = new Meteor.Collection("columns");

//verlaengert den Timergraphen um "time"
var setTimeGraph = function(task,time) {
  
  var currentID = Tasks.findOne({id:task.id})._id;
  var newTime = Tasks.findOne({id:task.id}).percent_average_completition_time + time;
  Tasks.update(currentID, {$set:{percent_average_completition_time: newTime}});
  
    if (Tasks.findOne({id:task.id}).percent_average_completition_time <= 1) {
      return task_width*(Tasks.findOne({id:task.id}).percent_average_completition_time);
    }
    else {/*
      d3.select('#' + task.id).select(".overtime").transition()
      .attr("points", task_width + ",0 " + task_width + "," + task_height + " " + (task_width - (task_width*(task.percent_average_completition_time-1))) + "," + task_height);*/
      return task_width;
  }
}


var setProgressGraph = function(task) {
  if (task.progress_state > 0) {
    return ((task.progress_state-1)*(task_width/dataset.Columns.length));
  }
  else return 0;
}

var setTimerColor = function(task){
  var color;
  
  if (((Tasks.findOne({id:task.id}).progress_state-1)/dataset.Columns.length) <= Tasks.findOne({id:task.id}).percent_average_completition_time)  {
    var mRed = (-50*3)/(task_width/dataset.Columns.length);
    var mGray = (150*3)/(task_width/dataset.Columns.length);
          
    var distance = (task_width* (Tasks.findOne({id:task.id}).progress_state/dataset.Columns.length)) - d3.select('#' + task.id).select(".timer").attr("width");

    var colorRed = Math.round(distance*mRed + 250);
    var colorGray = Math.round(distance*mGray + 50);
          
    if (colorGray > 200) colorGray = 200;
    if (colorRed < 200) colorRed = 200;
    
  color = "rgb(" + colorRed + "," + colorGray + "," + colorGray + ")";
  
  return color
  }
  else{
  color = "#82bfbf";
  
  return color;
  }
}


var update = function() {
  var TaskArray = Tasks.find().fetch();
  
  
  for (var i = 0; i < Tasks.find().count(); i++) {
    //fuer alle Tasks die nicht im Backlog sind
    if (!(TaskArray[i].progress_state == 0)) {
      
      //ist der Fortschritt groesser als der Timer?
      if (((TaskArray[i].progress_state-1)/dataset.Columns.length) > TaskArray[i].percent_average_completition_time) {
        d3.select('#' + TaskArray[i].id).select(".timer").remove();
        d3.select('#' + TaskArray[i].id).insert("rect", "line")
        .attr("class", "timer")
        .attr("height", task_height)
        .attr("width", setTimeGraph(TaskArray[i],0))
        .attr("fill", "#82bfbf");
      }

      //ist der Timer groesser als der Fortschritt?
      if (((TaskArray[i].progress_state-1)/dataset.Columns.length) < TaskArray[i].percent_average_completition_time) {
        var oldColor = d3.select('#' + TaskArray[i].id).select(".timer").attr("fill");
          
        d3.select('#' + TaskArray[i].id).select(".timer").remove();
        d3.select('#' + TaskArray[i].id).insert("rect",".progress")
          .attr("class", "timer")
          .attr("height", task_height)
          .attr("width", setTimeGraph(TaskArray[i],0))
          .attr("fill", oldColor);
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
    followTask = Tasks.findOne({id:t.after});
    positionUpdate(followTask, speed+100);
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
        var bID = Tasks.findOne({"id":b})._id;
        // Vorgaenger hat keinen Nachfolger mehr  
        Tasks.update(bID, {$set:{after:null}});
    }
  }
  // hat einen Nachfolger
  else {
    // und Vorgaenger
    if (b != null) {
        var beforeID = Tasks.findOne({"id":b})._id;
        var afterID = Tasks.findOne({"id":a})._id;
        
    // verknuepfen des Tasks
    Tasks.update(beforeID, {$set:{after:a}});
    Tasks.update(afterID, {$set:{before:b}});
    }
    // Nachfolger aber keinen Vorgaenger  
    else {
      var aID = Tasks.findOne({"id":a})._id;
      Tasks.update(beforeID, {$set:{before:null}});
    }
  // Nachruecken um Luecke zu schliessen
  afterTask = Tasks.findOne({id:a});
  positionUpdate(afterTask, 500);
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
  if (!(Tasks.findOne({id:task.id}).progress_state >= dataset.Columns.length+1)) {

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
var stop = function(task) {
   
 var posX = $('#' + task.id).position().left;
 var posY = spaceT;
  
  // Task auf alte Position zuruecksetzen 
  if((posX < (oldX+(task_width+spaceR)-task_width/3)) || (posX > oldX+(2*task_width))){
    d3.select('#' + task.id)
      .transition()
      .attr("transform", "translate(" + (oldX-tbX) + "," + (oldY-tbY) +")")
      .duration(1000)
      .ease("elastic");
  }
  
  // Task wird innerhalb der neuen Spalte losgelassen
  else{
    // State hochsetzten
    
    //alert(Tasks.findOne({id:task.id}).before);
    //alert(Tasks.findOne({id:task.id}).after);
    
    var newTaskState = Tasks.findOne({id:task.id}).progress_state+1;
    var currentTaskID = Tasks.findOne({id:task.id})._id;
    Tasks.update(currentTaskID, {$set:{progress_state:newTaskState}});
    // letzten Tasks der neuen Spalte finden
    var TaskArray = Tasks.find().fetch();
    
    for (var i = 0; i < Tasks.find().count(); i++) { 
      if ((newTaskState == TaskArray[i].progress_state) && (TaskArray[i].after == null) && (task.id != TaskArray[i].id)) {
        // Position unter den letzten Task
        posY = $('#' + TaskArray[i].id).position().top + task_height + spaceB - tbY;
        Tasks.update(TaskArray[i]._id, {$set:{after:task.id}});
        stateUpdate(Tasks.findOne({id:task.id}).before, Tasks.findOne({id:task.id}).after);
        Tasks.update(currentTaskID, {$set:{before:TaskArray[i].id}});
      }  
    }
    
    d3.select('#' + task.id)
      .transition()
      .attr("transform", "translate(" + (oldX+task_width+spaceR - tbX) + "," + posY +")")
      //Porgress Update
      .select(".progress").attr("width", setProgressGraph(Tasks.findOne({id:task.id})))
      .duration(600);
    if (posY == spaceT) {stateUpdate(Tasks.findOne({id:task.id}).before, Tasks.findOne({id:task.id}).after); Tasks.update(currentTaskID, {$set:{before:null}});}  
    Tasks.update(currentTaskID, {$set:{after:null}});
    update();
  }
}

// Berechnung der x und y Position bezueglich des States und des Vorgaengers
var position = function(task){
  var y, x;
  x = Tasks.findOne({id:task.id}).progress_state*(task_width + spaceR);
  
  if (Tasks.findOne({id:task.id}).before == null) { y = spaceT; }
  else {
    y = $('#' + Tasks.findOne({id:task.id}).before).position().top + task_height + spaceB - tbY;
  } 
  return "translate(" + x + "," + y + ")";
}

var timerTick = function() {
  update();
  var TaskArray = Tasks.find().fetch();
  for (var i = 0; i < Tasks.find().count(); i++) {
    if ((TaskArray[i].progress_state != 0) && (TaskArray[i].progress_state < (dataset.Columns.length+1))) {
      if(TaskArray[i].percent_average_completition_time <= 2) {
        var point = setTimeGraph(TaskArray[i], 0.01);
        var color = setTimerColor(TaskArray[i]);
        d3.select('#' + TaskArray[i].id).select(".timer").transition().attr("width", point).attr("fill", color);

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


var refresh = function(){
  //alert(Tasks.find().count());
  var fetch = Tasks.find().fetch();
  
  for (var i=0; i< Tasks.find().count(); i++) {
   var id = fetch[i]._id;
   Tasks.remove(id);
  }
  
  if (Tasks.find().count()== 0) { 
    for (var i = 0; i < dataset.task.length; i++) {
      Tasks.insert({
        "id": dataset.task[i].id,
        "progress_state": dataset.task[i].progress_state,
        "percent_average_completition_time": dataset.task[i].percent_average_completition_time,
        "before": dataset.task[i].before,
        "after": dataset.task[i].after
      });
    }
    renderTask();
    renderTaskboard();
  }
  
  else refresh();
}

// rendert alle Tasks
var renderTask = function() {
  
  // falls wir updaten, alle alten <g> loeschen
  d3.select("#taskboard").selectAll("g").remove();
  
  var taskboard = d3.select("#taskboard").selectAll()
  // Datenanbindung
  .data(Tasks.find().fetch()).enter()
  
  // SVG-Group
  .append("g")
  .attr("id" , function(d){return d.id})
  .attr("transform", function(d){return position(d)})    
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
    .attr("class", "timer")
    .attr("fill", function(d){ return setTimerColor(d)});
    
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
  
  d3.select("#taskboard").selectAll("text").remove();
  d3.select("#taskboard").selectAll("line").remove();
  
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


////// SERVER
if (Meteor.isServer) {
  
  Meteor.startup(function() {

    // wenn die Datenbank leer ist, mit Beispielen fuellen
    if (Tasks.find().count() === 0 && Columns.find().count() === 0) {
      // leere Tasks anlegen
      for (var i = 0; i < dataset.task.length; i++) {
      Tasks.insert({
        "id": dataset.task[i].id,
        "progress_state": dataset.task[i].progress_state,
        "percent_average_completition_time": dataset.task[i].percent_average_completition_time,
        "before": dataset.task[i].before,
        "after": dataset.task[i].after
        });
      }
      
      // Spalten anlegen
      Columns.insert({"id":"Entwerfen"});
      Columns.insert({"id":"Umsetzen"});
      Columns.insert({"id":"Ausliefern"});
    }
    
  });
  
  Tasks.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; } 
    });
  
  
  Meteor.publish("tasks", function() {
        return Tasks.find({});
    });
  
}

////// CLIENT
if (Meteor.isClient) {
  Meteor.subscribe("tasks", function(){
     //Set the reactive session as true to indicate that the data have been loaded
     Session.set('data_loaded', true);
      renderTask();
      renderTaskboard();
  });
  
  Meteor.startup(function() {
    Session.set('data_loaded', false); 
    $('#timeswitch').click(doTheClick);
    $('#back').click(refresh);
    
    Template.board.rendered = function() {
     tbX = $('#taskboard').position().left;
     tbY = $('#taskboard').position().top;
    }
    
  });
}

