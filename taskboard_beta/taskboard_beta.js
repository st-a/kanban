// globale Var
var task_width = 140, task_height = 30;
var average_time = 0;

// Abstand nach rechts/unter
var spaceR = 30;
var spaceB = 10;
var spaceT = 40;

//welcher Task würde zuletzt angesehen
var detailClick = null;

// Position der SVG im Browser
var tbX,tbY;

// Hilfsvariablen fuer DandD
var mTask, oldX, oldY;

// Timervariablen
var interval;

//Farben
var taskBg = "rgb(240,240,240)";
var boardColor = "#000000";

tickFrequenz = 30;

// Datenbank Objekte anlegen
Tasks = new Meteor.Collection("tasks");
Columns = new Meteor.Collection("columns");

var getStatePos = function(i){
  if (i == 0) {
    return task_width*(Columns.find().fetch()[i].average_completition_time/average_time);
  }
  else{
    var dist = 0;
    for (var j = 0; j<i; j++) {
      dist += task_width*(Columns.find().fetch()[j].average_completition_time/average_time);
    }
    return dist+task_width*(Columns.find().fetch()[i].average_completition_time/average_time);
  }
}

//verlaengert den Timergraphen um "time"
var setTimeGraph = function(task,time) {
  
  var currentID = Tasks.findOne({id:task.id})._id;
  var newTime = Tasks.findOne({id:task.id}).percent_average_completition_time + time;
  Tasks.update(currentID, {$set:{percent_average_completition_time: newTime}});
  
    if (Tasks.findOne({id:task.id}).percent_average_completition_time <= 1) {
      return task_width*(Tasks.findOne({id:task.id}).percent_average_completition_time);
    }
    else {
      return task_width;
  }
}

var setProgressGraph = function(task) {
  if (task.progress_state-1 > 0) {
    var pos = getStatePos((task.progress_state-2));
    return pos;
  }
  else return 0;
}

var setTimerColor = function(task){
  var color = "rgb(200,200,200)";
  if ((d3.select('#' + task.id).select(".progress").attr("width")/task_width) < Tasks.findOne({id:task.id}).percent_average_completition_time)  {
    if ((task.progress_state > 0) && (task.progress_state < (Columns.find().count()+1))) {
      if (Tasks.findOne({id:task.id}).percent_average_completition_time > getStatePos(task.progress_state-1)/task_width) {
        return "rgb(231,60,60)";
      }
    
    color = "rgb(200,200,200)";
    return color
    }
   else return color; 
  }
  
  if ((d3.select('#' + task.id).select(".progress").attr("width")/task_width) >= Tasks.findOne({id:task.id}).percent_average_completition_time)  {
  color = "rgb(26,188,156)";
  return color;
  }
}

var update = function() {
  var TaskArray = Tasks.find().fetch();
  
  for (var i = 0; i < Tasks.find().count(); i++) {
    //fuer alle Tasks die nicht im Backlog sind
    if (TaskArray[i].progress_state > 1) {
      var progress = getStatePos(TaskArray[i].progress_state-2);
      
      //ist der Fortschritt groesser als der Timer?
      if ((progress/task_width) >= TaskArray[i].percent_average_completition_time) {
        d3.select('#' + TaskArray[i].id).select(".timer").remove();
        d3.select('#' + TaskArray[i].id).insert("rect", "line")
        .attr("class", "timer")
        .attr("height", task_height)
        .attr("width", setTimeGraph(TaskArray[i],0))
        .attr("fill", "rgb(26,188,156)");
      }

      //ist der Timer groesser als der Fortschritt?
      if ((progress/task_width) < TaskArray[i].percent_average_completition_time) {
        var oldColor = d3.select('#' + TaskArray[i].id).select(".timer").attr("fill");
        d3.select('#' + TaskArray[i].id).select(".timer").remove();
        d3.select('#' + TaskArray[i].id).insert("rect",".progress")
          .attr("class", "timer")
          .attr("height", task_height)
          .attr("width", setTimeGraph(TaskArray[i],0))
          .attr("fill", oldColor)
          .transition()
          .attr("fill", setTimerColor(TaskArray[i]));
      }
    }
    else{
       d3.select('#' + TaskArray[i].id).select(".timer").attr("fill", setTimerColor(TaskArray[i]));
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
    positionUpdate(followTask, speed+50);
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
      Tasks.update(aID, {$set:{before:null}});
    }
  // Nachruecken um Luecke zu schliessen
  afterTask = Tasks.findOne({id:a});
  positionUpdate(afterTask, 300);
  } 
}

// am Begin des Drags
var start = function(id) {
  d3.selectAll("g").selectAll(".detailText").remove();
  d3.selectAll("g").selectAll("polygon").remove();
  d3.selectAll("g").selectAll(".detailRect").remove();
  detailClick = null;
  
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
  if((posX < (oldX+(task_width+spaceR)-task_width/3)) || (posX > oldX+(2*task_width+task_width/2))){
    d3.select('#' + task.id)
      .transition()
      .attr("transform", "translate(" + (oldX-tbX) + "," + (oldY-tbY) +")")
      .duration(1000)
      .ease("elastic");
  }
  
  // Task wird innerhalb der neuen Spalte losgelassen
  else{
    // State hochsetzten  
    var newTaskState = Tasks.findOne({id:task.id}).progress_state+1;
    var currentTaskID = Tasks.findOne({id:task.id})._id;
    Tasks.update(currentTaskID, {$set:{progress_state:newTaskState}});
    

    // letzten Tasks der neuen Spalte finden
    var TaskArray = Tasks.find().fetch();
    for (var i = 0; i < TaskArray.length; i++) { 
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
      
    if (posY == spaceT) {
      stateUpdate(Tasks.findOne({id:task.id}).before, Tasks.findOne({id:task.id}).after);
      Tasks.update(currentTaskID, {$set:{before:null}});
    }  
    Tasks.update(currentTaskID, {$set:{after:null}});

    update();
    setTimeout(function(){ processLineUpdate();},500);
  }
}

// Berechnung der x und y Position bezueglich des States und des Vorgaengers
var position = function(task){
  var x = task.progress_state*(task_width + spaceR);
  
  if (task.before == null) {
    var y = spaceT;
    var taskposition = "translate(" + x + "," + y + ")";
    d3.select('#'+ task.id).attr("transform", taskposition);
  }
  else {
   var y = $('#' + Tasks.findOne({id:task.id}).before).position().top + task_height + spaceB - tbY;
   var taskposition = "translate(" + x + "," + y + ")";
    d3.select('#'+ task.id).attr("transform", taskposition);
  }
  
  if (task.after != null) {
      position(Tasks.findOne({before:task.id}))
  }
}

var setDetailPolygon = function(task,i){
  var polygon = "0,0 0,0 0,0";
  var state = Tasks.findOne({id:task.id}).progress_state;
  if (!(i+1 >= state)) {
    polygon = ((task_width+task_width*(i-1))/dataset.Columns.length + "," + task_height + " " +
                "30," + task_height + " " + "30,0")
    /*
     *+ "," + task_height + " " +
              (task_width+task_width*(i))/dataset.Columns.length + "," + task_height + " " +
              (task_width+task_width*(i))/dataset.Columns.length + "," + task_height-10;*/
  }
  
  
  return polygon;
}

var detail = function(task){
  //remove all detail Elements
  d3.selectAll("g").selectAll(".detailText").remove();
  d3.selectAll("g").selectAll("polygon").remove();
  d3.selectAll("g").selectAll(".detailRect").remove();
  
  
  if (!(task.id == detailClick)) {
  d3.select('#' + task.id).insert("rect", "line")
    .attr("fill", "rgba(20,20,20,0.5)")
    .attr("class", "detailRect")
    .attr("width", task_width)
    .transition()
    .attr("height", task_height);
    

    d3.select('#' + task.id).selectAll()
    .data(dataset.Columns)
    .enter()
    .append("polygon")
    .attr("fill", "white")
    .attr("points", "0,0 0,0 0,0")
    .transition()
    .attr("points",function(d,i){return setDetailPolygon(task,i)});
    

  d3.select('#' + task.id).append("text")
  .text(task.id)
    .attr("x", "5")
    .attr("class", "detailText")
    .attr("font-size", "12px")
    .attr("font-family", "Helvetica")
    .attr("fill", "white")
    .transition()
    .attr("y", "15");
    
  detailClick = task.id; 
  }
    
}

var processLineUpdate = function (){
  for (var i = 0; i < Columns.find().count(); i++) {
    if(Tasks.findOne({progress_state:(i+1),after:null})){ 
      if ($('#processLine'+i).position().top != $('#' + Tasks.findOne({progress_state:(i+1),after:null}).id).position().top + task_height + spaceB) {
        x = (task_width+spaceR)*(i+1);
        y = $('#' + Tasks.findOne({progress_state:(i+1),after:null}).id).position().top - tbY + task_height + spaceB;
        d3.select('#processLine' + i).transition().attr("transform", "translate(" + x + "," + y + ")");
      }
    }  
    else{
      x = (task_width+spaceR)*(i+1);
      y = spaceT;
      d3.select('#processLine' + i).transition().attr("transform", "translate(" + x + "," + y + ")");
    }    
  }
  
  if(Tasks.findOne({progress_state:0,after:null})){ 
    if ($('#newTaskButton').position().top != $('#' + Tasks.findOne({progress_state:0,after:null}).id).position().top + task_height + spaceB) {
      y = $('#' + Tasks.findOne({progress_state:0,after:null}).id).position().top - tbY + task_height + spaceB;
      d3.select('#newTaskButton').transition().attr("transform", "translate(0," + y + ")");
    }
  }  
  else{
    y = spaceT;
    d3.select('#newTaskButton').transition().attr("transform", "translate(0," + y + ")");
  }  
}

var timerTick = function() {
  update();
  var TaskArray = Tasks.find().fetch();
  for (var i = 0; i < Tasks.find().count(); i++) {
    if ((TaskArray[i].progress_state != 0) && (TaskArray[i].progress_state < (dataset.Columns.length+1))) {
      if(TaskArray[i].percent_average_completition_time <= 2) {
        var point = setTimeGraph(TaskArray[i], (1/average_time)/tickFrequenz);
        var color = setTimerColor(TaskArray[i]);
        d3.select('#' + TaskArray[i].id).select(".timer").transition().attr("width", point).attr("fill", color);

      }
    }
  }
}

// Button fuer Zeit ein/aus
var timerSwitch = function() {
  if ($('input[name=timerswitch]').is(':checked')) {
    interval = setInterval(timerTick,1000);
  }
  else {
    clearInterval(interval);
  }
}

//setz alle Daten auf die JSON-Inhalte
var refresh = function(){
  var fetch = Tasks.find().fetch();
  
  for (var i=0; i< Tasks.find().count(); i++) {
   var id = fetch[i]._id;
   Tasks.remove(id);
  }
  
  
  if (Tasks.find().count() == 0) { 
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

var setNewTask = function(){
  alert("boing");  
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
  // Drag and Drop Event
  .call(d3.behavior.drag()
  .on("dragstart", function(d){start(d.id)})     
  .on("drag", function(d){move(d)})
  .on("dragend", function(d){stop(d)}))
  .on("click", function(d){ detail(d)});
  
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
    .attr("fill", "rgb(200,200,200)");
    
  // Fortschrittsgraph  
  taskboard.append("rect")
    .attr("height", task_height)
    .attr("width", 0)
    .attr("fill", "rgb(22,160,133)")
    .attr("class", "progress");
}

//rendert das Taskboard
var renderTaskboard = function(){
  average_time = 0;
  var ColumnArray = Columns.find().fetch();
  
  for (var i = 0; i < Columns.find().count(); i++) {
    average_time = average_time + ColumnArray[i].average_completition_time;
  }
  
  d3.select("#taskboard").selectAll("text").remove();
  d3.select("#taskboard").selectAll("line").remove();
  
  var taskboard = d3.select("#taskboard")
  
  taskboard.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .text("Backlog");
  
  taskboard.append("text").selectAll("tspan")
    .data(Columns.find().fetch())
    .enter()
    .append("tspan")
      .attr("x", function(d,i){ return (task_width+spaceR)*(i+1)})
      .attr("y", 15)
      .text(function(d){ return d.id});
    
  taskboard.selectAll("line")
    .data(Columns.find().fetch())
    .enter()
    .append("line")
      .attr("x1", function(d,i){ return (task_width+spaceR)*(i+1)})
      .attr("y1", spaceT-15)
      .attr("x2", function(d,i){ return ((task_width+spaceR)*(i+1))+task_width})
      .attr("y2", spaceT-15);
      
  taskboard.append("text")
    .attr("x", function(){return (Columns.find().count()+1)*(task_width+spaceR)})
    .attr("y", 15)
    .text("Done");
  
  taskboard.append("line")
    .attr("x1", function(){return (Columns.find().count()+1)*(task_width+spaceR)})
    .attr("y1", spaceT-15)
    .attr("x2", function(){return (Columns.find().count()+1)*(task_width+spaceR)+task_width})
    .attr("y2", spaceT-15);
    
  taskboard.append("line")
    .attr("x1", 0)
    .attr("y1", spaceT-15)
    .attr("x2", task_width)
    .attr("y2", spaceT-15);
   
  taskboard.selectAll("g").selectAll("line")
    .data(dataset.Columns)
    .enter()
    .append("line")
      .attr("x1", function(d,i){return getStatePos(i)})
      .attr("y1", 0)
      .attr("x2", function(d,i){return getStatePos(i)})
      .attr("y2", task_height); 
  
  
  for (var i = 0; i < Tasks.find().count(); i++) {
       d3.select('#' + Tasks.find().fetch()[i].id)
      .select(".progress").attr("width", setProgressGraph(Tasks.find().fetch()[i]));
  }
  
  var headTasks = Tasks.find({before:null}).fetch();
  for (var i = 0; i < headTasks.length; i++) {
    position(headTasks[i]);
  }
    
  taskboard.selectAll("line")
    .attr("stroke-width", 4)
    .attr("stroke", "#000000");
  taskboard.selectAll("g").selectAll("line")
    .attr("stroke-width", 1)
    .attr("stroke", "#c0c0c0");
  taskboard.selectAll("text")
    .attr("font-size", "20px")
    .attr("font-family", "Helvetica")
    .attr("fill", "#000000");
    
 var processLines = taskboard.selectAll()
    .data(dataset.Columns)
    .enter()
    .append("g")
      .attr("id" , function(d,i){ return "processLine" +i})
      .attr("transform",
            function(d,i){
              x = (task_width+spaceR)*(i+1);
              if (Tasks.findOne({progress_state:(i+1),after:null})) {
                y = $('#' + Tasks.findOne({progress_state:(i+1),after:null}).id).position().top - tbY + task_height + spaceB;
          
              }
              else {
                y = spaceT;
              }
              return "translate(" + x + "," + y +")" });
   
  processLines.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", task_width)
    .attr("y2", 0)
    .attr("stroke-width", 2)
    .attr("stroke", "rgb(150,150,150)");
  
  processLines.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .text(function(d){return d.average_completition_time + " min"})
    .attr("font-size", "15px")
    .attr("font-family", "Helvetica")
    .attr("fill", "rgb(150,150,150)");
    
  d3.select("#taskboard").append("g")
    .attr("id", "newTaskButton")
    .attr("transform",
          function(){
            if (Tasks.findOne({progress_state:0,after:null})) {
            y = $('#' + Tasks.findOne({progress_state:0,after:null}).id).position().top - tbY + task_height + spaceB;
            }
            else y = spaceT;
            return "translate(0," + y + ")";})
    .on("click", function(){ setNewTask() })
    .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", task_width)
      .attr("y1", 0)
      .attr("stroke-width", 2)
      .attr("stroke", "rgb(0,0,0)");
      
  d3.select("#newTaskButton")
    .append("text")
      .attr("x", 0)
      .attr("y", 15)
      .attr("font-size", "15px")
      .attr("font-family", "Helvetica")
      .attr("fill", "rgb(0,0,0)")
      .text("+ neuer Task"); 
    
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
      for (var i = 0; i < dataset.Columns.length; i++) {
      // Spalten anlegen
      Columns.insert({
                      "id": dataset.Columns[i].id,
                      "average_completition_time": dataset.Columns[i].average_completition_time
                     });
      }
    }
  });
  
  Tasks.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; } 
    });
  
  Columns.allow({
    insert: function () { return true; },
    update: function () { return true; },
    remove: function () { return true; } 
    });
  
  
  
  Meteor.publish("tasks", function() {
        return Tasks.find({});
    });
  
  Meteor.publish("columns", function() {
        return Columns.find({});
    });
  
}

////// CLIENT
if (Meteor.isClient) {
  
  
  Meteor.subscribe("tasks", function(){
     //Set the reactive session as true to indicate that the data have been loaded
     Session.set('data_loaded', true);
      renderTask();
  });
  
  Meteor.subscribe("columns", function(){
     //Set the reactive session as true to indicate that the data have been loaded
     Session.set('data_loaded', true);
      renderTaskboard();
  });

  
  Meteor.startup(function() {
    Session.set('data_loaded', false); 
    $('#timeswitch').click(timerSwitch);
    $('#back').click(refresh);
    $('#newTask').click(setNewTask);
    detailClick = null;
    
    Template.board.rendered = function() {
     tbX = $('#taskboard').position().left;
     tbY = $('#taskboard').position().top;
     
     task_height = $(document).height()/15;
     task_width = $(document).width()/7;
    }
    
  });
}

