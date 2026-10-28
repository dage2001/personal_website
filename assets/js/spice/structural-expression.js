import jsep from 'jsep';
import ternary from '@jsep-plugin/ternary';
jsep.plugins.register(ternary);
const scale={t:1e12,g:1e9,k:1e3,m:1e-3,u:1e-6,'µ':1e-6,'μ':1e-6,n:1e-9,p:1e-12,f:1e-15};
const functions={abs:Math.abs,sqrt:Math.sqrt,exp:Math.exp,ln:Math.log,log:Math.log,log10:Math.log10,sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,atan2:Math.atan2,sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,min:Math.min,max:Math.max,ceil:Math.ceil,floor:Math.floor,round:Math.round,int:Math.trunc,sgn:Math.sign,pow:Math.pow,pwr:(x,y)=>Math.abs(x)**y,mod:(x,y)=>x%y,limit:(x,a,b)=>Math.min(Math.max(x,a),b)};
const truth=x=>Number(x)>.5;
export function structuralValue(expression,params={}) {
  const active=new Set();let steps=0;
  function evaluate(text) {
    text=String(text).trim();if(/^\{[\s\S]*\}$/.test(text))text=text.slice(1,-1);
    text=text.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|(?<![\w.])(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?[a-zµμΩ]*\d*[a-zµμΩ]*(?![\w.])/gi,token=>{
      if(token[0]==='"'||token[0]==="'")return token;
      const [,number,suffix,fraction]=/^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zµμΩ]*)(\d*)[a-zµμΩ]*$/i.exec(token);
      const s=suffix.toLowerCase(),factor=s.startsWith('meg')?1e6:s.startsWith('mil')?25.4e-6:scale[s[0]]||1;
      const numeric=fraction?Number(number+(number.includes('.')?'':'.')+fraction):Number(number);
      return '('+(numeric*factor)+')';
    });
    return walk(jsep(text));
  }
  function walk(ast) {
    if(++steps>10000)throw Error('Structural expression is too complex.');
    if(ast.type==='Literal')return ast.value;
    if(ast.type==='Identifier') {
      const name=ast.name.toLowerCase();if(name==='pi')return Math.PI;if(name==='e')return Math.E;
      if(!Object.hasOwn(params,name))throw Error('Undefined structural parameter: '+ast.name);
      if(active.has(name))throw Error('Circular structural parameter: '+name);
      active.add(name);const value=evaluate(params[name]);active.delete(name);return value;
    }
    if(ast.type==='ConditionalExpression')return truth(walk(ast.test))?walk(ast.consequent):walk(ast.alternate);
    if(ast.type==='UnaryExpression') {const v=walk(ast.argument);if(ast.operator==='-')return -v;if(ast.operator==='+')return +v;if(ast.operator==='!'||ast.operator==='~')return !truth(v);}
    if(ast.type==='BinaryExpression') {
      const a=walk(ast.left);if(ast.operator==='&&')return truth(a)&&truth(walk(ast.right));if(ast.operator==='||')return truth(a)||truth(walk(ast.right));
      const b=walk(ast.right);
      switch(ast.operator){case '+':return a+b;case '-':return a-b;case '*':return a*b;case '/':return a/b;case '**':return a**b;case '%':return a%b;case '^':return truth(a)!==truth(b);case '&':return truth(a)&&truth(b);case '|':return truth(a)||truth(b);case '>':return a>b;case '<':return a<b;case '>=':return a>=b;case '<=':return a<=b;case '==':case '===':return a===b;case '!=':case '!==':return a!==b;}
    }
    if(ast.type==='CallExpression'&&ast.callee.type==='Identifier') {
      const name=ast.callee.name.toLowerCase();if(name==='if'){if(ast.arguments.length!==3)throw Error('if() needs three arguments.');return truth(walk(ast.arguments[0]))?walk(ast.arguments[1]):walk(ast.arguments[2]);}
      if(Object.hasOwn(functions,name))return functions[name](...ast.arguments.map(walk));
    }
    throw Error('Unsupported structural expression. No JavaScript execution is allowed.');
  }
  const value=evaluate(expression);if(typeof value==='number'&&!Number.isFinite(value))throw Error('Structural expression is not finite.');return value;
}
