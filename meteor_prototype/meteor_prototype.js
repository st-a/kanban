////// GLOBAL

var renderSampleTask = function() {

  var task_width = 200, task_height = 100;

  // Zeichenfläche erzeugen
  var sampleTaskSVG = d3.select("#sample_task")
  .append("svg")
  .attr("width", task_width)
  .attr("height", task_height);

  // Task-Rechteck zeichnen
  sampleTaskSVG.append("rect")
  .style("stroke", "none")
  .style("fill", "#404040")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", task_width)
  .attr("height", task_height);

  // Zeit-Dreieck zeichnen
  sampleTaskSVG.append("polygon")
  .style("stroke", "none")
  .style("fill", "#ef3c39")
  .attr("points", "0,0 0," + task_height + " " + (task_width-20) + "," + task_height);

  // Fortschritts-Dreieck zeichnen
  sampleTaskSVG.append("polygon")
  .style("stroke", "none")
  .style("fill", "#00a99d")
  .attr("points", "0,0 0," + task_height + " " + (task_width-80) + "," + task_height);
}

////// CLIENT

if (Meteor.isClient) {
  // wenn div #sample_task angezeigt wird, Task rendern
  Template.task.rendered = function() {
    renderSampleTask();
  }
}

////// SERVER

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
