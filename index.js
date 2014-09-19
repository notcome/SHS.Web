var fs = require('fs');

var mapFile = fs.readFileSync('./utf32-cn.map', { encoding: 'utf8' });
mapFile = mapFile.split('\n').slice(0, -1);

var map = {};
var mapReg = /<([^>]+)>\t([0-9]+)/;
for (var i = 0; i < mapFile.length; i ++) {
  // <0000xxxx> nnnn
  var match = mapReg.exec(mapFile[i]);
  var unicode = parseInt(match[1], 16),
          cid = parseInt(match[2]);
  map[unicode] = cid;
}

var subsetFile = fs.readFileSync('./level1.txt', { encoding: 'utf8' });
subsetFile = subsetFile.split('\n').join('');

console.log(subsetFile.length);

var subsetMap = [];
for (var i = 0; i < subsetFile.length; i ++) {
  var unicode = subsetFile.charCodeAt(i);
  subsetMap.push([unicode, map[unicode]]);
}

console.log(subsetMap.length);

subsetMap.sort(function (lhs, rhs) {
  return lhs[0] - rhs[0];
});

function intToUTF32 (value) {
  value = new Number(value);
  var result = value.toString(16).toUpperCase();
  while (result.length < 8)
    result = '0' + result;
  return result;
}


var output = '';
for (var i = 0; i < subsetMap.length; i ++) {
  var line = '';
  line += '<';
  line += intToUTF32(subsetMap[i][0]);
  line += '>';
  line += '\t';
  line += new Number(subsetMap[i][1]).toString();
  output += line + '\n';
}

var subsetCMD = '/0';
for (var i = 0; i < subsetMap.length; i ++) {
  subsetCMD += ',/' + subsetMap[i][1];
}

fs.writeFileSync('./result.map', output, { encoding: 'utf8' });
fs.writeFileSync('./subsetCMD', subsetCMD, { encoding: 'utf8' });

