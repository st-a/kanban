////// GLOBAL

// wie viele Spalten gibt es?
var column_count = data.columns.length;

// einen Task rendern
var renderTask = function(text, percent_completed, percent_average_completition_time) {

  var task_width = 200, task_height = 80;

  //// Reihenfolge und Farben festlegen
  
  var fortschritt_vor_zeit = null; // null oder "polygon"
  var farbe_zeit = rot = "#ef3c39", farbe_fortschritt = türkis = "#00a99d",
    türkis_vorne = "#82bfbf", grau = "#404040", grau_vorne = "#999999";

  // Reihenfolge ermitteln: Fortschritt > Zeit?
  if (percent_completed > percent_average_completition_time) {
    fortschritt_vor_zeit = "polygon";
    farbe_zeit = türkis_vorne;
  }

  // Task beendet?
  if (percent_completed == 1) {
    if (fortschritt_vor_zeit) farbe_zeit = grau_vorne;
    else {
      farbe_fortschritt = grau_vorne;
      farbe_zeit = rot;
    }
  }

  //// SVG zeichnen

  // Zeichenfläche erzeugen
  var sampleTaskSVG = d3.select("#" + text)
  .append("svg")
  .attr("width", task_width)
  .attr("height", task_height);

  // Task-Rechteck zeichnen
  sampleTaskSVG.append("rect")
  .style("stroke", "none")
  .style("fill", grau)
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", task_width)
  .attr("height", task_height);

  // Zeit-Dreieck zeichnen
  sampleTaskSVG.append("polygon")
  .style("stroke", "none")
  .style("fill", farbe_zeit)
  .attr("points", "0,0 0," + task_height + " " + (task_width * percent_average_completition_time) + "," + task_height);

  // Fortschritts-Dreieck zeichnen
  sampleTaskSVG.insert("polygon", fortschritt_vor_zeit)
  .style("stroke", "none")
  .style("fill", farbe_fortschritt)
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
