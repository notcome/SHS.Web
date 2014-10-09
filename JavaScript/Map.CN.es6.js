var fs = require('fs');
var parseMap = require('./MapIO').parseMap;

var mapFile = fs.readFileSync('../FontsData/Map/UTF32.CN', 'utf8');

module.exports = parseMap(mapFile.split('\n').filter(line => line != ''));
