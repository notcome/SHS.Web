var info = require('./info');
var map = require('../JavaScript/Map.CN');
var fs = require('fs');

function destructing (puncs) {
  var toUnicode = chars => chars.map(char => char.charCodeAt(0));
  var toCIDs = unicodes => unicodes.map(unicode => map[unicode]);

  function pairsToOpenClosing (pairs) {
    var open = [], closing = [];
    for (var i = 0; i < pairs.length; i ++)
      if (i % 2 == 0)
        open.push(pairs[i]);
      else
        closing.push(pairs[i]);
    return [toUnicode(open), toUnicode(closing)];
  }

  var [open, closing] = pairsToOpenClosing(puncs.pairs);
  closing = closing.concat(toUnicode(puncs.stops.split('')));
  var idsp = toUnicode([puncs.idsp]);

  function othersToCharsCIDs (others) {
    var chars = [], cids = [];
    for (var i = 0; i < others.length; i ++)
      if (typeof others[i] == 'number')
        cids.push(others[i]);
      else
        chars.push(others[i]);
    return [toUnicode(chars), cids];
  }

  var [chars, cids] = othersToCharsCIDs(puncs.others);
  
  var unicodes = chars.concat(open, closing, idsp);
  cids = cids.concat(toCIDs(unicodes));

  return [toCIDs(open), toCIDs(closing), toCIDs(idsp), unicodes, cids];
}

var [open, closing, idsp, unicodes, cids] = destructing(info.punctuations);

function makeKerns (puncs, rules) {
  var newKern = (cid1, cid2) => 'position \\' + cid1 + ' \\' + cid2 + ' -500;';
  var kerns = [];

  rules.forEach(([first, second]) => {
    var set1 = puncs[first],
        set2 = puncs[second];

    set1.forEach(glyph1 => set2.forEach(glyph2 =>
      kerns.push(newKern(glyph1, glyph2))));
  });

  return kerns;
}

var kerns = makeKerns({ open: open, closing: closing, idsp: idsp }, info.rules);

function generateFeatures () {
  var prefix = fs.readFileSync('./features.prefix', 'utf8');

  function generateFeatureBlock (block) {
    var firstLine = block.type + ' ' + block.name + ' {';
    var lastLine = '} ' + block.name + ';\n'
    var lines = block.content.map(function (line) {
      return '  ' + line;
    });
    return [firstLine].concat(lines, [lastLine]).join('\n');
  } 

  var features = [];
  info.features.forEach(feature => features.push(generateFeatureBlock(feature)));
  features.push(generateFeatureBlock({
    type: 'feature',
    name: 'kern',
    content: kerns
  }));

  features = features.join('\n');
  features = prefix + features;

  fs.writeFileSync('./features', features, 'utf8');
}

generateFeatures();

function generateSubsetMap () {
  var subset = {};
  for (var i = 0; i < unicodes.length; i ++)
    subset[unicodes[i]] = map[unicodes[i]];

  var generateMap = require('../JavaScript/MapIO').generateMap;
  fs.writeFileSync('./Map.subset', generateMap(subset).join('\n'), 'utf8');
}

generateSubsetMap();

var subsetCMD = '/0';
for (var i = 0; i < cids.length; i ++) {
  subsetCMD += ',/' + cids[i];
}

fs.writeFileSync('./command', subsetCMD, 'utf8');
