var express    =    require('express');
var app        =    express();

require('./router/main')(app);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
var server     =    app.listen(8081,function(){
    console.log("We have started our server on port 8081");
});
