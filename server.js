var express    =    require('express');
var config 	   =    require('./config');
var app        =    express();
var cors       =    require('cors')

var serverPort = config.server.port;

require('./router/main')(app);
app.use(cors())
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('styles'));
app.use(express.static('scripts'));
var server     =    app.listen(serverPort,function(){
    console.log("We have started our server on port " + serverPort);
});


