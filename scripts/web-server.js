var express = require('express');
var path = require('path');
var app = express();
var rootPath = path.normalize(__dirname+'/../');
app.use('/',express.static(rootPath + '/app'));
app.use('/bower_components', express.static(rootPath + '/bower_components'));
app.listen(8000);
console.log('Listening on port 8000');