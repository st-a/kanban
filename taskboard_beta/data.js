dataset = { "task":[

            {"id":"Login", "percent_average_completition_time":0 , "progress_state": 0, "before":null ,"after":"Nutzersteuerung", "state_history0":0, "state_history1":0, "state_history2":0 },
            {"id":"Nutzersteuerung", "percent_average_completition_time":0, "progress_state": 0, "before":"Login" ,"after":"Eingabe", "state_history0":0, "state_history1":0, "state_history2":0},
            {"id":"Eingabe", "percent_average_completition_time":0, "progress_state": 0, "before":"Nutzersteuerung" ,"after":"Management", "state_history0":0, "state_history1":0, "state_history2":0},
            {"id":"Management", "percent_average_completition_time":0, "progress_state": 0, "before":"Eingabe" ,"after":null, "state_history0":0, "state_history1":0, "state_history2":0},
  

            {"id":"Backend", "percent_average_completition_time":0.3, "progress_state": 1, "before":null ,"after":null, "state_history0":0, "state_history1":0, "state_history2":0},



            {"id":"Datenbank", "percent_average_completition_time":0.3, "progress_state": 2, "before":null ,"after":"Middleware", "state_history0":0.13, "state_history1":0, "state_history2":0},
            {"id":"Middleware", "percent_average_completition_time":0.6, "progress_state": 2, "before":"Datenbank" ,"after":"Benutzer", "state_history0":-0.23, "state_history1":0, "state_history2":0},
            {"id":"Benutzer", "percent_average_completition_time":0.2, "progress_state": 2, "before":"Middleware" ,"after":null, "state_history0":0.40, "state_history1":0, "state_history2":0},
            

            {"id":"Storage", "percent_average_completition_time":0.7, "progress_state": 3, "before":null ,"after":"Interface", "state_history0":-0.15, "state_history1":0.1, "state_history2":0},        
            {"id":"Interface", "percent_average_completition_time":0.8, "progress_state": 3, "before":"Storage" ,"after":null, "state_history0":-0.11, "state_history1":-0.26, "state_history2":0},        

            {"id":"Prototyp", "percent_average_completition_time":1.4 , "progress_state": 4, "before":null ,"after":"Webserver", "state_history0":-0.1, "state_history1":-0.3, "state_history2":-0.4},
            {"id":"Webserver", "percent_average_completition_time":0.9, "progress_state": 4, "before":"Prototyp" ,"after":"Client", "state_history0":0.1, "state_history1":0.2, "state_history2":0.2},
            {"id":"Client", "percent_average_completition_time":1, "progress_state": 4, "before":"Webserver" ,"after":null, "state_history0":0.2, "state_history1":-0.39, "state_history2":0}
            ],

        "Columns":[
            
            {"id":"Entwerfen", "average_completition_time":2},
            {"id":"Umsetzen", "average_completition_time":1},
            {"id":"Ausliefern", "average_completition_time":3}
        ]
};