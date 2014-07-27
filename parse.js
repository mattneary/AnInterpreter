var Parser = require('./Parser');
var number = "[0-9]+",
    operator = "([*+-\\/\\^•∊~↓⍳←∘×])",
    hoo = "[\\.]",
    variable = "[a-zA-Z_]";

module.exports = Parser(function(
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
module.exports.operator = operator;

