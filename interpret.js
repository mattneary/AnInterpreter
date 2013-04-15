var identity = function(x) {
	return x;
};
var binary_parse = function(expr, fold) {
	if( expr.match(/\)λ([^λ]+)λ([^λ\s]+)?\)?$/) ) {
		// parenthetical
		var parts = expr.match(/([\s\S]+)?\(([^)]+)\)λ([^λ]+)λ([^λ\s]+)?\)?$/);
		var eval = [parts[3], parse(parts[2]), parts[4]?parse(parts[4]):fold];
		return parts[1] ? parse(parts[1], eval) : eval;
	} else {
		var parts = expr.match(/([\s\S]+)?([^λ]+)λ([^λ]+)λ([^λ\s]+)?\)?$/);
		var eval = [parts[3], parse(parts[2]), parts[4]?parse(parts[4]):fold];
		return parts[1] ? parse(parts[1], eval) : eval;
	}
};
var unary_parse = function(expr, fold) {
	var parts = expr.match(/([\s\S]+)?Λ([^Λ]+)Λ([^\sλΛ]+)?$/);	
	var eval = [parts[2], parts[3]?parse(parts[3]):fold];
	return parts[1] ? parse(parts[1], eval) : eval;
};
var clean = function(expr) {
	return expr[0] == '(' ? expr.substr(1) : expr.substr(0, expr.length - 1);
};
var parse = function(expr, fold) {
	/*
		expr = <expr>λ<fn>λ<expr>
				| Λ<var>Λ<expr>
				| <val>
		val = [0-9]+ | '[^']+'
	*/
	var rules = [
		[/Λ([^\sλΛ]+)?$/, unary_parse],
		[/λ([^\sλΛ]+)?$/, binary_parse],		
		[/(\([^)]+|[^(]+\))$/, clean],
		[/$/, identity]
	];
	
	// parse expression with matching rule
	var parsed;
	rules.forEach(function(rule) {
		if( rule[0].test(expr) && !parsed ) {
			parsed = rule[1](expr, fold);
		}
	});

	return parsed;
};
var translate = function(APL) {
	var binary = '∊,∘.×,/,←,↓'.split(','),
		unary = '~,⍳'.split(',');
	return APL.replace(new RegExp('('+binary.join('|')+')', 'g'), 'λ$1λ').replace(new RegExp('('+unary.join('|')+')', 'g'), 'Λ$1Λ');
};

var distribute = function(cb, obj, x) {
	return (obj && obj.map) ? obj.map(function(a){return cb(a, x);}) : cb(obj, x);
};
var library = function(env) {
	this['~'] = function(vect) {
		return distribute(function(x) {
			return !x;
		}, vect);
	},
	this['⍳'] = function(vect) {
		return distribute(function(x) {
			return Array(x).join(0).split(0).map(function(_, n){return n+1;});
		}, vect);
	},
	this['∊'] = function(vectA, vectB) {
		return distribute(function(a) {
			return vectB && vectB.indexOf(a) != -1;
		}, vectA);
	},
	this['∘.×'] = function(vectA, vectB) {
		return vectA && vectA.map(function(a) {
			return vectB && vectB.map(function(b) {
				return a*b;
			});
		}).reduce(function(a, b) {
			return a.concat(b);
		});
	},
	this['/'] = function(vectA, vectB) {
		return vectB && vectB.filter(function(_, n) {
			return vectA[n];
		});
	},
	this['←'] = function(name, value) {		
		this[name] = value;
		return value;
	},
	this['↓'] = function(count, vect) {
		return vect.slice(count);
	};
};
var interpret = function(x, env) {
	if( typeof x == 'string' ) {
		if( x.match(/^[0-9]+$/) ) {
			return parseInt(x);
		} else {
			return env[x] || x;
		}
	} else {
		var exprs = x && x.reverse().map(function(expr) { return interpret(expr, env); });
		return exprs && exprs.pop().apply(env, exprs.reverse());
	}
};

var trans = translate('(~R∊R∘.×R)/R←1↓⍳7'),
	pars = parse(trans),
	prog = interpret(pars, new library({}));
console.log(prog);