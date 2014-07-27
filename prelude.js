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
module.exports = {
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

