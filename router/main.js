var config = require('../config');

module.exports = function(app)
{

	app.get('/',function(req,res){
		res.render('kanban.html')
	});
	 
    app.get('/about',function(req,res){
		res.render('about.html');
    });
	
	app.get('/kanban', function (req, res) {
		res.render( 'kanban.html' );
	});
	
	app.get('/add_to_db', function (req, res) {
		res.render( 'add_to_db.html' );
	});
	
	app.get('/example_json', function (req, res) {
		res.send({ "records":[ {"Name":"Alfreds Futterkiste","City":"Berlin","Country":"Germany"}, {"Name":"Ana Trujillo Emparedados y helados","City":"México D.F.","Country":"Mexico"}, {"Name":"Antonio Moreno Taquería","City":"México D.F.","Country":"Mexico"}, {"Name":"Around the Horn","City":"London","Country":"UK"}, {"Name":"B's Beverages","City":"London","Country":"UK"}, {"Name":"Berglunds snabbköp","City":"Luleå","Country":"Sweden"}, {"Name":"Blauer See Delikatessen","City":"Mannheim","Country":"Germany"}, {"Name":"Blondel père et fils","City":"Strasbourg","Country":"France"}, {"Name":"Bólido Comidas preparadas","City":"Madrid","Country":"Spain"}, {"Name":"Bon app'","City":"Marseille","Country":"France"}, {"Name":"Bottom-Dollar Marketse","City":"Tsawassen","Country":"Canada"}, {"Name":"Cactus Comidas para llevar","City":"Buenos Aires","Country":"Argentina"}, {"Name":"Centro comercial Moctezuma","City":"México D.F.","Country":"Mexico"}, {"Name":"Chop-suey Chinese","City":"Bern","Country":"Switzerland"}, {"Name":"Comércio Mineiro","City":"São Paulo","Country":"Brazil"} ] });
	})
	
	app.get('/get_users', function (req, res) {
		GetFromMongo('users2', res);
	})	

	app.get('/get_kanban', function (req, res) {
		GetFromMongo('kanban', res);
	})	
    
	app.get('/update_users', function (req, res) {
        
        var record = { "name": "modulus admin", "age": 42, "roles": "help" } ;
        var newValue = { $set: { "roles.$" : "help2" } };
        
		UpdateMongo('users', record, newValue);
	})	
    
	app.get('/update_kanban', function (req, res) {
        
        var record = req.query ;
        delete record._id;
		ReplaceMongo('kanban', record, "ger");
	})	

	app.get('/insert_users', function (req, res) {
		var user1 = {first_name: req.query.first_name, sur_name:req.query.last_name};
		AddToMongo('users2', user1)
	    res.end(JSON.stringify(user1));
	})

	app.get('/insert_kanban', function (req, res) {
		var kanban = {state: req.query.state, name:req.query.name};		
		AddToMongo('kanban', kanban)
	    res.end(JSON.stringify(kanban));
	})

	function AddToMongo(collectionName, newRecord)
	{

		var mongodb = require('mongodb');

		//We need to work with "MongoClient" interface in order to connect to a mongodb server.
		var MongoClient = mongodb.MongoClient;

		// Connection URL. This is where your mongodb server is running.
		var url = config.mongo.host;

		// Use connect method to connect to the Server
		MongoClient.connect(url, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected. :)
			console.log('Connection established to', url);

			// Get the  collection
			var collection = db.collection(collectionName);

			// Insert some users
			collection.insert(newRecord, function (err, result) {
			  if (err) {
				console.log(err);
			  } else {
				console.log('Inserted:', result);
			  }
			  //Close connection
			  db.close();
			});
		  }
		});

	}


	function GetFromMongo(collectionName, res)
	{
		//lets require/import the mongodb native drivers.
		var mongodb = require('mongodb');

		//We need to work with "MongoClient" interface in order to connect to a mongodb server.
		var MongoClient = mongodb.MongoClient;

		// Connection URL. This is where your mongodb server is running.
		var url = config.mongo.host;

		// Use connect method to connect to the Server
		MongoClient.connect(url, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected. :)
			console.log('Connection established to', url);

			// Get the collection
			var collection = db.collection(collectionName);
		
			collection.find().toArray(function (err, result) {
				if (err) {
					console.log(err);
				} else if (result.length) {
					res.end(JSON.stringify(result));
				} else {
					console.log('No document(s) found with defined "find" criteria!');
				}

			});

		  }

		});

	}
    
    
    
    
    function UpdateMongo(collectionName,  record, newValue)
	{

		var mongodb = require('mongodb');

		//We need to work with "MongoClient" interface in order to connect to a mongodb server.
		var MongoClient = mongodb.MongoClient;

		// Connection URL. This is where your mongodb server is running.
		var url = config.mongo.host;

		// Use connect method to connect to the Server
		MongoClient.connect(url, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected. :)
			console.log('Connection established to', url);

			// Get the  collection
			var collection = db.collection(collectionName);

			// Insert some users
			collection.updateOne(
                record,   newValue              
                , function (err, result) {
			  if (err) {
				console.log(err);
			  } else {
				console.log('Inserted:', result);
			  }
			  //Close connection
			  db.close();
			});
		  }
		});

	}
    
    
    function ReplaceMongo(collectionName, record, owner)
	{

		var mongodb = require('mongodb');

		//We need to work with "MongoClient" interface in order to connect to a mongodb server.
		var MongoClient = mongodb.MongoClient;

		// Connection URL. This is where your mongodb server is running.
		var url = config.mongo.host;

		// Use connect method to connect to the Server
		MongoClient.connect(url, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected. :)
			console.log('Connection established to', url);

			// Get the  collection
			var collection = db.collection(collectionName);
            var ObjectId = mongodb.ObjectId;
			// Insert some users
            //try {
            //    collection.replaceOne(
            //        { "owner": owner},
            //        record
            //    );
            //} catch (e) {
            //    print(e);
            //}
            
            collection.replaceOne(
                { "owner": owner},   record              
                , function (err, result) {
			  if (err) {
				console.log(err);
			  } else {
				console.log('Replaced:', result);
			  }
			  //Close connection
			  db.close();
			});
            
            
            
            
		  }
		});

	}




}
