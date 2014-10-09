function makeNamedCapture(regex, transformers) {
  return function(string) {
    var match = regex.exec(string);
    var object = {};
    for (var i = 0; i < transformers.length; i++) {
      var $__1 = transformers[i],
          key = $__1[0],
          transform = $__1[1];
      object[key] = transform(match[i + 1]);
    }
    return object;
  };
}
function makePrint(format, transformers) {
  var delimiter = arguments[2] !== (void 0) ? arguments[2] : '$';
  format = format.split(delimiter);
  return function() {
    for (var args = [],
        $__0 = 0; $__0 < arguments.length; $__0++)
      args[$__0] = arguments[$__0];
    var result = format[0];
    for (var i = 1; i < format.length; i++) {
      var j = i - 1;
      result += transformers[j](args[j]);
      result += format[i];
    }
    return result;
  };
}
var parseUTF32CIDPair = makeNamedCapture(/<([^>]+)>[\ ]+([0-9]+)/, [['UTF32', (function(str) {
  return parseInt(str, 16);
})], ['CID', (function(str) {
  return parseInt(str);
})]]);
var generateUTF32CIDPair = makePrint('<$>  $', [(function(UTF32) {
  var str = new Number(UTF32).toString(16).toUpperCase();
  while (str.length < 8)
    str = '0' + str;
  return str;
}), (function(CID) {
  return CID;
})]);
module.exports = {
  parseMap: function(lines) {
    var map = {};
    lines.forEach((function(line) {
      var pair = parseUTF32CIDPair(line);
      map[pair.UTF32] = pair.CID;
    }));
    return map;
  },
  generateMap: function(map) {
    var lines = [];
    for (var UTF32 in map) {
      var line = generateUTF32CIDPair(UTF32, map[UTF32]);
      lines.push(line);
    }
    return lines;
  }
};
