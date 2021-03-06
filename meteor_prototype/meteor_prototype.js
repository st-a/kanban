////// GLOBAL

// globale Eigenschaften der Spalten und Tasks
var column_count = data.columns.length;
var column_width, task_width, task_height;

// einen Task rendern, SVG dem DOM hinzufügen
var renderTask = function(task) {

  //// Reihenfolge und Farben festlegen
  
  var fortschritt_vor_zeit = null; // null oder "polygon"
  var farbe_zeit = rot = "#ef3c39", farbe_fortschritt = türkis = "#00a99d",
    türkis_vorne = "#82bfbf", grau = "#404040", grau_vorne = "#999999";

  // Reihenfolge ermitteln: Fortschritt > Zeit?
  if (task.percent_completed > task.percent_average_completition_time) {
    fortschritt_vor_zeit = "polygon"; // wird von null auf "polygon" gesetzt, weil es das zweite Attribut von d3.insert ist
    farbe_zeit = türkis_vorne;
  }

  // Task beendet?
  if (task.percent_completed == 1) {
    if (fortschritt_vor_zeit) farbe_zeit = grau_vorne;
    else {
      farbe_fortschritt = grau_vorne;
      farbe_zeit = rot;
    }
  }

  //// SVG in DOM einfügen

  // Zeichenfläche erzeugen
  var sampleTaskSVG = d3.select("#" + task.id)
  .append("svg")

  // Task-Rechteck zeichnen
  sampleTaskSVG.append("rect")
  .style("stroke", "none")
  .style("fill", grau)
  .attr("x", 0)
  .attr("y", 0)

  // Zeit-Dreieck zeichnen
  sampleTaskSVG.append("polygon")
  .attr("class", "time")
  .style("stroke", "none")
  .style("fill", farbe_zeit)

  // Fortschritts-Dreieck zeichnen
  sampleTaskSVG.insert("polygon", fortschritt_vor_zeit) // ist fortschritt_vor_zeit = "polygon", dann wird es vor dem Zeitdreieck im DOM eingefügt
  .attr("class", "progress")
  .style("stroke", "none")
  .style("fill", farbe_fortschritt)
}

// Größe von Tasks und Spalten berechnen und global speichern
var calculateBoardSize = function() {

  var column_max_width = 250, task_width_height_ratio = 0.4, task_column_ratio = 0.9;
  var board_width = $('#board').width();

  // Spalten- & Taskbreite berechnen und ggf. begrenzen
  column_width = board_width / column_count;
  if (column_width > column_max_width) column_width = column_max_width;
  $('.column').css('width', column_width);
  task_width = column_width * task_column_ratio;
  task_height = task_width * task_width_height_ratio;
}

// Größe des Tasks anpassen
var sizeTask = function(task) {
  // Zeichenfläche
  $('#' + task.id + ' svg').attr("width", task_width);
  $('#' + task.id + ' svg').attr("height", task_height);
  // Rechteck
  $('#' + task.id + ' rect').attr("width", task_width);
  $('#' + task.id + ' rect').attr("height", task_height);
  // Dreiecke
  $('#' + task.id + ' .time').attr("points", "0,0 0," + task_height + " " + (task_width * task.percent_average_completition_time) + "," + task_height);
  $('#' + task.id + ' .progress').attr("points", "0,0 0," + task_height + " " +  (task_width * task.percent_completed) + "," + task_height);
}

////// CLIENT

if (Meteor.isClient) {

  // wird ausgeführt, sobald das Dokument fertig geladen ist
  Meteor.startup(function() {

    //Größe der Tasks und Spalten initialisieren
    calculateBoardSize();

    // nach Änderung der Fenstergröße, alle Tasks neu zeichnen
    $(window).resize(function() {
      calculateBoardSize();
      for(column in data.columns) {
        for(task in data.columns[column].tasks) {
          sizeTask(data.columns[column].tasks[task]);
        }
      }
    });

  });
  
  // div-Elemente im DOM erzeugen
  Template.board.columns = function() {
    return data.columns;
  }

  // jedes mal, wenn das Task-template geladen wird, entsprechendes SVG einfügen
  Template.task.rendered = function() {
    renderTask(this.data);
    sizeTask(this.data);
  };
}

////// SERVER

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
}
