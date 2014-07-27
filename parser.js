var identity = function(x){return x;};
var parseParen = function(parse, str) {
  var nested = 0,
    paren = "",
    rest = "",
    matched = false;
  for( var i = 0; i < str.length; i++ ) {
    var read = str[i];
    if( read == '(' && !matched ) {
      nested++;
      if( nested == 1 ) {
        paren = "";
      } else {
        paren += read;
      }
    } else if( read == ')' && !matched ) {
      nested--;
      if( nested == 0 ) {
        matched = true; 
      } else {
        paren += read;
      }
    } else if(matched) {
      rest += read;
    } else {
      paren += read;
    }
  }
  if( rest ) {
    var parsed = parse('_'+rest);                  
    parsed.splice(1, 1, parse(paren));    
    return parsed;
  } else {
    return parse(paren);
  }
};
var parseMonadicOp = function(parse, str) {
  var op = str[0],
    rest = str.substr(1);
  return [op, parse(rest)];
};
var parseCompoundOp = function(str) {
  var parts = str.split(new RegExp(or(operator, hoo)+"+")),
    first = parts[0],
    op = str.match(new RegExp(or(operator, hoo)+"+"))[0],
    rest = str.substr(first.length + op.length);
  if( op.length == 3 ) {
    return [[op[1], op[0], op[2]], parse(first), parse(rest)];
  } else {
    return [[op[0], op[1]], parse(first), parse(rest)];
  }
};
var parseMonadicCompoundOp = function(str) {
  var op = str.match(leading(or(operator, hoo)+"+"))[0],
    rest = str.substr(op.length);
  if( op.length == 3 ) {
    return [[op[1], op[0], op[2]], parse(rest)];
  } else {
    return [[op[0], op[1]], parse(rest)];
  }
};

var parseOp = function(operator, parse, str) {
  var first = str.split(new RegExp(operator))[0],
    op = str.substr(first.length, 1),
    rest = str.substr(first.length + 1);
  return [op, parse(first), parse(rest)];
};
var just = function(pattern) {
  return new RegExp("^"+pattern+"$");
};
var leading = function(pattern) {
  return new RegExp("^"+pattern);
};
var or = function(a, b) {
  return "("+a+"|"+b+")";
};
var repeat = function(pattern, n) {
  return pattern+"{"+n+"}"
};
var optional = function(pattern) {
  return pattern+"?";
};

var fs = [identity, parseParen, parseMonadicOp, parseCompoundOp, parseMonadicCompoundOp, parseOp, just, leading, or, repeat, optional];
var fNames = "identity, parseParen, parseMonadicOp, parseCompoundOp, parseMonadicCompoundOp, parseOp, just, leading, or, repeat, optional".split(", ");
module.exports = function(f) {
  return f.apply({}, fs);
};
fs.forEach(function(f, i) {
  module.exports[fNames[i]] = f;
});

