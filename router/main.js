var config = require('../config');
var mongodb = require('mongodb');
var database;

module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('kanban.html')
    });

    app.get('/get_kanban', function(req, res) {
        MongoAction(GetFromMongo, ['kanban', res]);
    })

    app.get('/update_kanban', function(req, res) {
        var record = req.query;
        delete record._id;
        MongoAction(ReplaceMongo, ['kanban', record, "ger"]);
    })

    app.get('/insert_kanban', function(req, res) {
        var kanban = {
            state: req.query.state,
            name: req.query.name
        };
        MongoAction(AddToMongo, ['kanban', kanban]);
        res.end(JSON.stringify(kanban));
    })

    function MongoAction(actionCallback, args) {

        //We need to work with "MongoClient" interface in order to connect to a mongodb server.
        var MongoClient = mongodb.MongoClient;

        // Connection URL. This is where your mongodb server is running.
        var url = config.mongo.host;

        // Use connect method to connect to the Server
        MongoClient.connect(url, function(err, db) {
            database = db;
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                //HURRAY!! We are connected. :)
                console.log('Connection established to', url);

                actionCallback.apply(this, args);

            }
        });

    }

    function AddToMongo(collectionName, newRecord) {
        // Get the  collection
        var collection = database.collection(collectionName);

        // Insert some users
        collection.insert(newRecord, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('Inserted:', result);
            }
            //Close connection
            database.close();
        });

    }


    function GetFromMongo(collectionName, res) {

        // Get the collection
        var collection = database.collection(collectionName);

        collection.find().toArray(function(err, result) {
            if (err) {
                console.log(err);
            } else if (result.length) {
                res.end(JSON.stringify(result));
            } else {
                console.log('No document(s) found with defined "find" criteria!');
            }
            //Close connection
            database.close();
        });

    }

    function UpdateMongo(collectionName, record, newValue) {
        // Get the  collection
        var collection = database.collection(collectionName);

        // Insert some users
        collection.updateOne(
            record, newValue,
            function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Inserted:', result);
                }
                //Close connection
                database.close();
            });

    }

    function ReplaceMongo(collectionName, record, owner) {
        // Get the  collection
        var collection = database.collection(collectionName);
        var ObjectId = mongodb.ObjectId;

        collection.replaceOne({
            "owner": owner
        }, record, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('Replaced:', result);
            }
            //Close connection
            database.close();

        });

    }

}