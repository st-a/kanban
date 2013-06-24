dataset = { "task":[

            {"id":"Login", "percent_average_completition_time":0 , "progress_state": 0, "before":null ,"after":"Nutzersteuerung"},
            {"id":"Nutzersteuerung", "percent_average_completition_time":0, "progress_state": 0, "before":"Login" ,"after":"Eingabe"},
            {"id":"Eingabe", "percent_average_completition_time":0, "progress_state": 0, "before":"Nutzersteuerung" ,"after":"Management"},
            {"id":"Management", "percent_average_completition_time":0, "progress_state": 0, "before":"Eingabe" ,"after":null},
  

            {"id":"Backend", "percent_average_completition_time":0.3, "progress_state": 1, "before":null ,"after":null},



            {"id":"Datenbank", "percent_average_completition_time":0.3, "progress_state": 2, "before":null ,"after":"Middleware"},
            {"id":"Middleware", "percent_average_completition_time":0.6, "progress_state": 2, "before":"Datenbank" ,"after":"Benutzer"},
            {"id":"Benutzer", "percent_average_completition_time":0.2, "progress_state": 2, "before":"Middleware" ,"after":null},
            

            {"id":"Storage", "percent_average_completition_time":0.7, "progress_state": 3, "before":null ,"after":"Interface"},        
            {"id":"Interface", "percent_average_completition_time":0.8, "progress_state": 3, "before":"Storage" ,"after":null},        

            {"id":"Prototyp", "percent_average_completition_time":1.4 , "progress_state": 4, "before":null ,"after":"Webserver"},
            {"id":"Webserver", "percent_average_completition_time":0.9, "progress_state": 4, "before":"Prototyp" ,"after":"Client"},
            {"id":"Client", "percent_average_completition_time":1, "progress_state": 4, "before":"Webserver" ,"after":null}
            ],

        "Columns":[
            
            {"id":"Entwerfen", "average_completition_time":2},
            {"id":"Umsetzen", "average_completition_time":1},
            {"id":"Ausliefern", "average_completition_time":3}
        ]
};