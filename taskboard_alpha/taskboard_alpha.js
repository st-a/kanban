//globale Var
var task_width = 200, task_height = 100;
var mTask;

//Button zum spielen
var update = function(){
  d3.selectAll("g").transition().attr("transform", "translate(100,100").duration(1000);
}

//Am Begin des Drags
function start(id) {
//Mousepos innerhalb eines Tasks  
mTask = d3.mouse($('#' + id)[0]);

}

//Funktion während des Drags
function move(id){
//Mousepos im Taskboard  
var mTaskboard = d3.mouse($('#taskboard')[0]);
var dragTarget = d3.select('#' + id);
    
    newX =(mTaskboard[0]-mTask[0]);
    newY =(mTaskboard[1]-mTask[1]);
    //alert(newX + "," + newY);
    dragTarget
        .attr("transform", "translate(" + newX  + "," + newY + ")");
};

//Funktion beim Drop
function stop() {

}


//Berechnung der x und y Position bezueglich des States und des Vorgaengers
var position = function(state, before){
  var y, x;

  x = state*(task_width+20);
  
  if (before == null) {
    y = 0;
  }
  else {
    y = $('#' + before).position().top + task_height-20 ;
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
    .on("dragend", stop))
    
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
     renderTask();
  };
   
}

////// SERVER

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
}
  
  
