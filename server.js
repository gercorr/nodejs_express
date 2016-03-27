var express    =    require('express');
var config 	   =    require('./config');
var app        =    express();

var serverPort = config.server.port;

require('./router/main')(app);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
var server     =    app.listen(serverPort,function(){
    console.log("We have started our server on port " + serverPort);
});
