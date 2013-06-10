dataset = { "task":[

            {"id":"Login", "percent_completed":0, "percent_average_completition_time":0 , "state": 0, "before":null ,"after":"Nutzersteuerung"},
            {"id":"Nutzersteuerung", "percent_completed":0, "percent_average_completition_time":0, "state": 0, "before":"Login" ,"after":"Eingabe"},
            {"id":"Eingabe", "percent_completed":0, "percent_average_completition_time":0, "state": 0, "before":"Nutzersteuerung" ,"after":"Management"},
            {"id":"Management", "percent_completed":0, "percent_average_completition_time":0, "state": 0, "before":"Eingabe" ,"after":null},
  

            {"id":"Backend", "percent_completed":0.2, "percent_average_completition_time":0.3, "state": 1, "before":null ,"after":null},



            {"id":"Datenbank", "percent_completed":0.3, "percent_average_completition_time":0.3, "state": 2, "before":null ,"after":"Middleware"},
            {"id":"Middleware", "percent_completed":0.4, "percent_average_completition_time":0.7, "state": 2, "before":"Datenbank" ,"after":"Benutzer"},
            {"id":"Benutzer", "percent_completed":0.5, "percent_average_completition_time":0.2, "state": 2, "before":"Middleware" ,"after":null},
            

            {"id":"Storage", "percent_completed":0.6, "percent_average_completition_time":0.7, "state": 3, "before":null ,"after":"Interface"},        
            {"id":"Interface", "percent_completed":0.8, "percent_average_completition_time":0.8, "state": 3, "before":"Storage" ,"after":null},        

            {"id":"Prototyp", "percent_completed":1, "percent_average_completition_time":1.4 , "state": 4, "before":null ,"after":"Webserver"},
            {"id":"Webserver", "percent_completed":1, "percent_average_completition_time":0.9, "state": 4, "before":"Prototyp" ,"after":"Client"},
            {"id":"Client", "percent_completed":1, "percent_average_completition_time":1, "state": 4, "before":"Webserver" ,"after":null}
            ],

        "Columns":[
            
            {"id":"Entwerfen"},
            {"id":"Umsetzen"},
            {"id":"Ausliefern"},
        ]
};


// {"id":"", "percent_completed":, "percent_average_completition_time":},