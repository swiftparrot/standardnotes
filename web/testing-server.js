// Used for running mocha tests

var connect = require('connect');
var serveStatic = require('serve-static');
var port = 7000;
connect().use(serveStatic(__dirname)).listen(port, function(){
    console.log(`Server running on ${port}...`);
});
