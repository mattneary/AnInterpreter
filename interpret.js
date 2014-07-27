var fs = require('fs'),
    prelude = require('./prelude'),
    Parser = require('./Parser'),
    parse = require('./parse'),
    operator = parse.operator;

// The evaluator
var eval = function(expr, env) {
  if( typeof expr == "string" )
    return typeof env[expr] == 'undefined' ? expr : env[expr];
  if( typeof expr == 'number' )
    return expr;
  if( Parser.just(operator).test(expr[0]) ) {
    if( expr.length == 2 ) {
      return env.monadic[expr[0]](eval(expr[1], env), env);
    } else {
      var b = eval(expr[2], env),
	  a = eval(expr[1], env);
      return env.dyadic[expr[0]](a, b, env);
    }
  }
};
var evalparse = function(expr, env) {
  var resp = eval(parse(expr), env);  
  return resp;
};

fs.readFile(__dirname + '/example.apl', function(err, data) {
  console.log(evalparse(data+"", prelude));
});

