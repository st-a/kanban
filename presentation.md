# Konzept 

+ Konflikte im Projektmanagement
+ Agile Methoden
+ Kanban
  + Manifest: blendet Zeit aus
  + Realität: Nutzer schreiben Daten auf Zettel


# Änderungen am Konzept

+ Taskhintergrund blasser, so Betonung der Form
+ Fortschritt nicht kontinuierlich erfassbar, ändert sich automatisch beim Verschieben des Tasks
+ Spaltenbreite konstant, so bessere Vergleichbarkeit
+ Dreiecke verworfen
  + Whitespace
  + schlecht vergleichbar
  + schlecht mit Text kombinierbar
  + stattdessen Balken


# Technik

+ JavaScript & SVG
  + Meteor
  + D3
  + jQuery
  + JSON


# Ausblick

+ Zeit berechnen
+ Möglichkeit von Deadlines prüfen
+ Deformation der Tasks bei überschreiten der durchschnittlichen Durchlaufzeit
+ Prozessübergänge in Tasks durch Linien markieren
+ Ressourcen
  + Spalten limitieren
  + Höhe als Faktor für Durchschnittszeit
  + Höhe der Tasks anpassbar machen
  + Tasks teilbar machen
+ Tasks gruppieren bzw. Subtasks erstellen
+ Tasks Hinzufügen / Bearbeiten
+ Daten I/O
  + Datenbank
  + Speichern / Laden
+ Problem: Redundanz von Fortschritt & Position auf Board
