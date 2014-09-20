function makeNamedCapture (regex, transformers) {
  return function (string) {
    var match = regex.exec(string);
    var object = {};
    for (var i = 0; i < transformers.length; i ++) {
      var [key, transform] = transformers[i];
      object[key] = transform(match[i + 1]);
    }
    return object;
  };
}

function makePrint (format, transformers, delimiter = '$') {
  format = format.split(delimiter);

  return function (...args) {
    var result = format[0];
    for (var i = 1; i < format.length; i ++) {
      var j = i - 1;
      result += transformers[j](args[j]);
      result += format[i];
    }
    return result;
  };
}

function passObjectToFunction (func, keys, self = null) {
  function generateArgs (obj) {
    var args = [];
    keys.forEach (function (key) {
      args.push(obj[key]);
    });
    return args;
  }

  return function (obj) {
    return func.apply(self, generateArgs(obj));
  };
}

var parseMap = makeNamedCapture(/<([^>]+)>\t([0-9]+)/, [
    ['UTF32', str => parseInt(str, 16),],
    ['CID',   str => parseInt(str)]
  ]);

var testInput = "<0000117A>\t487";
var IR = parseMap(testInput);

var generateMap = makePrint('<$>\t$', [
    UTF32 => {
      var str = new Number(UTF32).toString(16).toUpperCase();
      while (str.length < 8)
        str = '0' + str;
      return str;
    },
    CID => CID
  ]);

var output = generateMap(IR.UTF32, IR.CID);

console.log(JSON.stringify(IR));
console.log(output);

generateMap = passObjectToFunction(generateMap, ['UTF32', 'CID']);
var output = generateMap(IR);

console.log(output);
