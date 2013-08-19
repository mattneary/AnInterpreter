var fs = require('fs');

// The syntax definition - parser.
var number = "[0-9]+",
	operator = "([*+-\\/\\^•∊~↓⍳←∘×])",
	hoo = "[\\.]",
	variable = "[a-zA-Z_]";
	// TODO: make variable allow for whitespace in between,
	//       i.e., list shorthand
var parse = function(str) {
	var exprs = [
		// number literal
		[just(number), parseInt],
		// dyadic operations
		[leading(or(number, variable)+optional(operator)+hoo+operator), parseCompoundOp],
		[leading(or(number, variable)+operator), parseOp],
		// monadic operations
		[leading(optional(operator)+hoo+operator), parseMonadicCompoundOp],
		[leading(operator), parseMonadicOp],
		// parenthetical
		[/^[(]/, parseParen],
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
	
// The parser dependencies.	
var identity = function(x){return x;};
var parseParen = function(str) {
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
var parseMonadicOp = function(str) {
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

var parseOp = function(str) {
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
}

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
	} else if( just(operator).test(expr[0]) ) {
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

// The Function Library
var deepContains = function(set, x) {
	if( set[0].map ) {
		return set.map(function(s) {
			return deepContains(s, x)
		}).reduce(function(a,b) {
			return a||b;
		});
	}
	return set.indexOf(x) != -1;
};
var prelude = {
	dyadic: {
		"+": function(a,b){return a+b},
		"*": function(a,b){return a*b},
		"^": function(a,b){return Math.pow(a, b);},
		"•": function(x,y) { return [Math.sin, Math.cos, Math.tan][x](y); },
		"-": function(a,b) { return a-b; },
		"↓": function(a,b) { return b.slice(a); },
		"←": function(name, val, env) {
			env[name] = val; 
			return val; 
		},
		"/": function(as,bs) { 
			return bs.filter(function(b, index) {
				return as[index];
			});
		},
		"×": function(as,bs) {
			return as.map(function(a) {
				return bs.map(function(b) {
					return a*b;
				});
			});
		},
		"∊": function(a,b) {
			var op = this["∊"].bind(this);
			if( a.map ) {
				return a.map(function(a) {
					return op(a,b);
				});
			}			
			return deepContains(b, a) ? 1 : 0;
		}
	},
	monadic: {
		"-": function(a) { return -a; },
		"⍳": function(x) {
			return Array(x).join(0).split(0).map(function(_, index) {
				return index+1;
			}) 
		},
		"~": function(x) {
			var op = this["~"].bind(this);
			if( x.map ) {
				return x.map(function(x) {
					return op(x);
				});
			}
			return x == 0 ? 1 : 0;
		}
	}
};

fs.readFile(__dirname + '/example.apl', function(err, data) {
	console.log(JSON.stringify(parse("(~R∊R∘.×R)/R←1↓⍳R")));
//	console.log(evalparse(data+"", prelude));
});
