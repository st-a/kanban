////// GLOBAL

var renderSampleTask = function(percent_completed, percent_average_completition_time) {

  //var percent_completed = 0, percent_average_completition_time = 0;
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
  .attr("points", "0,0 0," + task_height + " " + (task_width * percent_average_completition_time) + "," + task_height);

  // Fortschritts-Dreieck zeichnen
  sampleTaskSVG.append("polygon")
  .style("stroke", "none")
  .style("fill", "#00a99d")
  .attr("points", "0,0 0," + task_height + " " + (task_width * percent_completed) + "," + task_height);
}

////// CLIENT

if (Meteor.isClient) {

  // wird ausgeführt, sobald das Dokument geladen ist
  Meteor.startup(function() {
    // console.log(data.tasks[0].name);
  });
  
  // wenn div #sample_task angezeigt wird, Task rendern
  Template.task.rendered = function() {
    renderSampleTask(data.tasks[0].percent_completed, data.tasks[0].percent_average_completition_time);
  }
}

////// SERVER

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
