////// GLOBAL

// wie viele Spalten gibt es?
var column_count = data.columns.length;

// einen Task rendern
var renderTask = function(text, percent_completed, percent_average_completition_time) {

  var task_width = 200, task_height = 100;

  // Zeichenfläche erzeugen
  var sampleTaskSVG = d3.select("#" + text)
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
  .attr("points", "0,0 0," + task_height + " " +  (task_width * percent_completed) + "," + task_height);
}

////// CLIENT

if (Meteor.isClient) {

  // wird ausgeführt, sobald das Dokument geladen ist
  Meteor.startup(function() {
    // console.log(column_count);
  });
  
  // div-Elemente im DOM erzeugen
  Template.board.columns = function() {
    return data.columns;
  }

  // jedes mal, wenn das task-template geladen wird, entsprechendes SVG einfügen
  Template.task.rendered = function() {
    renderTask(this.data.text, this.data.percent_completed, this.data.percent_average_completition_time);
  };
}

////// SERVER

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
}
