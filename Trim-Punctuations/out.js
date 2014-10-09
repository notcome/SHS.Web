var info = require('./info');
var map = require('../JavaScript/Map.CN');
var fs = require('fs');
function destructing(puncs) {
  var toUnicode = (function(chars) {
    return chars.map((function(char) {
      return char.charCodeAt(0);
    }));
  });
  var toCIDs = (function(unicodes) {
    return unicodes.map((function(unicode) {
      return map[unicode];
    }));
  });
  function pairsToOpenClosing(pairs) {
    var open = [],
        closing = [];
    for (var i = 0; i < pairs.length; i++)
      if (i % 2 == 0)
        open.push(pairs[i]);
      else
        closing.push(pairs[i]);
    return [toUnicode(open), toUnicode(closing)];
  }
  var $__0 = pairsToOpenClosing(puncs.pairs),
      open = $__0[0],
      closing = $__0[1];
  closing = closing.concat(toUnicode(puncs.stops.split('')));
  var idsp = toUnicode([puncs.idsp]);
  function othersToCharsCIDs(others) {
    var chars = [],
        cids = [];
    for (var i = 0; i < others.length; i++)
      if (typeof others[i] == 'number')
        cids.push(others[i]);
      else
        chars.push(others[i]);
    return [toUnicode(chars), cids];
  }
  var $__1 = othersToCharsCIDs(puncs.others),
      chars = $__1[0],
      cids = $__1[1];
  var unicodes = chars.concat(open, closing, idsp);
  cids = cids.concat(toCIDs(unicodes));
  return [toCIDs(open), toCIDs(closing), toCIDs(idsp), unicodes, cids];
}
var $__0 = destructing(info.punctuations),
    open = $__0[0],
    closing = $__0[1],
    idsp = $__0[2],
    unicodes = $__0[3],
    cids = $__0[4];
function makeKerns(puncs, rules) {
  var newKern = (function(cid1, cid2) {
    return 'position \\' + cid1 + ' \\' + cid2 + ' -500;';
  });
  var kerns = [];
  rules.forEach((function($__1) {
    var $__2 = $__1,
        first = $__2[0],
        second = $__2[1];
    var set1 = puncs[first],
        set2 = puncs[second];
    set1.forEach((function(glyph1) {
      return set2.forEach((function(glyph2) {
        return kerns.push(newKern(glyph1, glyph2));
      }));
    }));
  }));
  return kerns;
}
var kerns = makeKerns({
  open: open,
  closing: closing,
  idsp: idsp
}, info.rules);
function generateFeatures() {
  var prefix = fs.readFileSync('./features.prefix', 'utf8');
  function generateFeatureBlock(block) {
    var firstLine = block.type + ' ' + block.name + ' {';
    var lastLine = '} ' + block.name + ';\n';
    var lines = block.content.map(function(line) {
      return '  ' + line;
    });
    return [firstLine].concat(lines, [lastLine]).join('\n');
  }
  var features = [];
  info.features.forEach((function(feature) {
    return features.push(generateFeatureBlock(feature));
  }));
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
function generateSubsetMap() {
  var subset = {};
  for (var i = 0; i < unicodes.length; i++)
    subset[unicodes[i]] = map[unicodes[i]];
  var generateMap = require('../JavaScript/MapIO').generateMap;
  fs.writeFileSync('./Map.subset', generateMap(subset).join('\n'), 'utf8');
}
generateSubsetMap();
var subsetCMD = '/0';
for (var i = 0; i < cids.length; i++) {
  subsetCMD += ',/' + cids[i];
}
fs.writeFileSync('./command', subsetCMD, 'utf8');
