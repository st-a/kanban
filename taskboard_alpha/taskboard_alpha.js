var task_width = 200, task_height = 100;


var update = function(){
  d3.selectAll("g").transition().attr("transform", "translate(100,100").duration(1000);
}

var position = function(state, before){
  //alert(d);
  var y, x;
  
  x = state*(task_width+20);
  
  //alert(before);
  if (before == null) {
    y = 0;
  }
  
  else {
  y = $('#' + before).position().top + task_height-20 ;
  }
  
  return "translate(" + x + "," + y + ")";
  
}



var renderTask = function() {
var datad = [ 5, 10, 15, 20, 25 ];



var Sample

  //// Reihenfolge und Farben festlegen
  d3.select("#taskboard").selectAll("g")

.data(dataset.task).enter()

    .append("g")
    .attr("id" , function(d){return d.id})
    .attr("transform", function(d){return position(d.state, d.before)})
    .append("rect")
    .attr("height", task_height)
    .attr("width", task_width)
    .attr("fill", "red");
    



  //// SVG in DOM einfügen

  // Zeichenfläche erzeugen

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
  
  
