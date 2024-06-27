/**
 * jison 编译计算器库
 * @author: Steven Yan <yanjunzhu@baidu.com>
 * 参考：https://github.com/GerHobbelt/jison
 * 安装编译库：npm install jison-gho -g
 * 编译：jison calculator.jison 生成calculator.js
 * 按需修改为module.exports or export
*/

/* description: Parses and executes mathematical expressions. */
%{

let isDeg = false;

var setIsDeg = function (e) {
    isDeg = e;
    return e;
}

var fac = function (v) {
    var str = String(v);
    var reg = /^[0-9]\d*$/;
    if (v === Infinity) {
        return Infinity;
    }
    if (!reg.test(str)) {
        throw new Error('阶乘只支持正整数或0:' + str);
    } else {
        if (v === 1 || v === 0) {
            return 1;
        } else if (v > 170) {
            return Infinity;
        } else {
            return v * fac(v - 1);
        }
    }
}


var tan = function (v) {
    var res;

    if (isDeg && v % 90 === 0 && v !== 0) {
        throw new Error();
    }

    if (isDeg) {
        res = Math.tan(v / 180 * Math.PI);
    } else {
        res = Math.tan(v);
    }
    res = parseFloat(res.toFixed(15));

    if (!isDeg && res > 1.63e16) {
        throw new Error();
    }

    return res;
};


var cos = function (v) {
    var res;

    if (isDeg) {
        res = Math.cos(v / 180 * Math.PI);
    } else {
        res = Math.cos(v);
    }
    res = parseFloat(res.toFixed(15));

    return res;
};


var sin = function (v) {
    var res;

    if (isDeg) {
        res = Math.sin(v / 180 * Math.PI);
    } else {
        res = Math.sin(v);
    }
    res = parseFloat(res.toFixed(15));

    return res;
};


var atan = function (v) {
    var res;
    if (isDeg) {
        res = Math.atan(v) / Math.PI * 180;
    } else {
        res = Math.atan(v);
    }
    res = parseFloat(res.toFixed(13));
    return res;
};


var acos = function (v) {
    var res;
    if (isDeg) {
        res = Math.acos(v) / Math.PI * 180;
    } else {
        res = Math.acos(v);
    }
    res = parseFloat(res.toFixed(13));
    return res;
};


var asin = function (v) {
    var res;
    if (isDeg) {
        res = Math.asin(v) / Math.PI * 180;
    } else {
        res = Math.asin(v);
    }
    res = parseFloat(res.toFixed(13));
    return res;
};


var dComp = function (v) {
    if (v === 0) {
        throw new Error('divided by 0');
    }
    return v;
}

%}

/* lexical grammar */
%lex
%%

\s+                                       /* skip whitespace */
[0-9]+("."[0-9]+)?("e""-"?"+"?[0-9]+)?\b  return 'NUMBER';
"*"                                       return '*';
"×"                                       return '*';
"/"                                       return '/';
"÷"                                       return '/';
"-"                                       return '-';
"+"                                       return '+';
"^"                                       return '^';
"√"                                       return 'SQRT';
"sin"                                     return 'sin';
"tan"                                     return 'tan';
"cos"                                     return 'cos';
"atan"                                    return 'atan';
"acos"                                    return 'acos';
"asin"                                    return 'asin';
"ln"                                      return 'ln';
"log"                                     return 'log';
"!"                                       return '!';
"isDeg"                                   return 'isDeg';
"%"                                       return '%';
"("                                       return '(';
")"                                       return ')';
"π"                                       return 'PI';
"Math.E"                                  return 'Math.E';
<<EOF>>                                   return 'EOF';
.                                         return 'INVALID';

/lex

/* operator associations and precedence */
%left '+' '-'
%left 'SQRT' '*' '/'
%right '%'
%right '^'
%right '!'
%left 'sin' 'cos' 'tan' 'asin' 'acos' 'atan' 'ln' 'log'
%left UMINUS
%token INVALID
%start expressions

%% /* language grammar */

expressions
    : e EOF
        { return $1; }
    ;

e
    : NUMBER
        {$$ = Number(yytext);}
    | 'Math.E'
        {$$ = Math.E;}
    | 'PI'
        {$$ = Math.PI;}
    | e '%'
        {$$ = $1 / 100;}
    | e '^' e
        {$$ = Math.pow($1, $3);}
    | e '*' e
        {$$ = $1 * $3;}
    | e '/' e
        {$$ = $1 / dComp($3);}
    | e '+' e
        {$$ = $1 + $3;}
    | e '-' e
        {$$ = $1 - $3;}
    | 'ln' e
        {$$ = Math.log($2);}
    | 'log' e
        {$$ = Math.log10($2);}
    | 'SQRT' e
        {$$ = $2 ** 0.5}
    | e 'SQRT' e
        {$$ = ($3) ** (1 / $1);}
    | 'isDeg' e
        {$$ = setIsDeg($2);}
    | 'sin' e
        {$$ = sin($2);}
    | 'cos' e
        {$$ = cos($2);}
    | 'tan' e
        {$$ = tan($2);}
    | 'asin' e
        {$$ = asin($2);}
    | 'acos' e
        {$$ = acos($2);}
    | 'atan' e
        {$$ = atan($2);}
    | e '!'
        {$$ = fac($1);}
    | '(' e ')'
        {$$ = $2;}
    | '-' e
        {$$ = -$2;}
    ;

