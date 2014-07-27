var fs = require('fs'),
    prelude = require('./prelude'),
    Parser = require('./parser');

// The syntax definition - parser.
var number = "[0-9]+",
    operator = "([*+-\\/\\^•∊~↓⍳←∘×])",
    hoo = "[\\.]",
    variable = "[a-zA-Z_]";
var parse = Parser(function(
  identity, parseParen, parseMonadicOp, parseCompoundOp, parseMonadicCompoundOp,
  parseOp, just, leading, or, repeat, optional) {

  return function(str) {
    var exprs = [
      // number literal
      [just(number), parseInt],
      // dyadic operations
      [leading(or(number, variable)+optional(operator)+hoo+operator), parseCompoundOp],
      [leading(or(number, variable)+operator), parseOp.bind({}, operator, arguments.callee)],
      // monadic operations
      [leading(optional(operator)+hoo+operator), parseMonadicCompoundOp],
      [leading(operator), parseMonadicOp.bind({}, arguments.callee)],
      // parenthetical
      [/^[(]/, parseParen.bind({}, arguments.callee)],
      // string literal (variable access)
      [/^/, identity]
    ];
    var matched = false,
      parse;
    exprs.forEach(function(expr) {
      if( expr[0].test(str) && !matched ) {
	matched = true;
	parse = expr[1](str);
      }
    });
    return matched && parse;
  };
});
  
// The evaluator
var eval = function(expr, env) {
  if( typeof expr == "string" ) {
    return typeof env[expr] == 'undefined' ? expr : env[expr];
  } else if( typeof expr == 'number' ) {
    return expr;
  } else if( expr[0].map ) {
    if( expr.length == 2 ) {
      return env.monadic[expr[0]](eval(expr[1], env), env);
    } else {
      var b = eval(expr[2], env),
        a = eval(expr[1], env);
      return env.dyadic[expr[0]](a, b, env);
    }
  } else if( Parser.just(operator).test(expr[0]) ) {
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

