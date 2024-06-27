# 使用YACC(Jison)构建一个科学计算器解释库

> YACC 代表 Yet Another Compiler Compiler。 Yacc 的 GNU 版叫做 Bison。JavaScript版为 Jison。
>
> 它是一种工具，将任何一种编程语言的所有语法翻译成针对此种语言的 Yacc 语 法解析器。它用巴科斯范式(BNF, Backus Naur Form)来书写。
>
> 用 Yacc 通过在语法文件上运行 Yacc 生成一个解析器。

Jison Github: [https://github.com/zaach/jison](https://github.com/zaach/jison)

参考：[编译原理-如何使用flex和yacc工具构造一个高级计算器_编译原理,编写计算器,yacc-CSDN博客](https://blog.csdn.net/liaopiankun0618/article/details/84232771)

## 基本语法

jison主要分为四段：

* 原始代码：编译时会直接将完整代码插入生成js文件中，作用域为全局
* lex语法部分

  * 关键词token申明：针对表达式中的关键词进行声明并替换
  * 运算符关联和优先级：为左结合或右结合的运算符指定%left或%right。最后列出的token具有最高的优先级。
  * 运算表达式：将会对每一个递归表达式进行运算和替换。

## 快速实践

### 插入任意的JS代码

在 %{ 和 }% 内插入任意的JS代码均可，其作用域为实例内，可以在全实例内调用。

例如可以插入dComp函数使得运算 1 / 0 时抛出错误而不是得出Infinity的结果。

```js
var dComp = function (v) {
    if (v === 0) {
        throw new Error('divided by 0');
    }
    return v;
}
```

对于是否为角度（反之为弧度制），可以在原始代码段中加入一个变量和一个函数，通过在表达式运算时调用函数进行设置：

```js
var isDeg = false;
var setIsDeg = function (e) {
    isDeg = e;
    return e;
}
```

### token申明部分

可以理解为replace函数，将表达式中的关键符号进行替换，主要的目的是使的每个token唯一，相同功能的token相同。

支持简单的正则匹配：

| .     | 任意字符（除新行）    |
| ----- | --------------------- |
| \n    | 新行                  |
| *     | 0个或多个             |
| +     | 1个或多个             |
| ?     | 0个或1个              |
| ^     | 行的起始              |
| $     | 行的终止              |
| a     | b                     |
| (ab)+ | 1个或多个 ab          |
| [0-9] | 0-9数字组中的任意一个 |
| "a+b" | 非正则字符串          |

需要注意的点

> `[0-9]+("."[0-9]+)?("e""-"?"+"?[0-9]+)?\b` 兼容1.2  1.2e3  1.3e-4
>
> 需要有 <`<EOF>`> 匹配结尾以返回数据

```js
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
```

### 运算符关联和优先级

使用 %left 标明左结合运算符，%right 标明什么是右结合运算符。简单来说，左结合就相当于从左往右添加括号计算，反之则为右结合。

举例说明：

* `%left '+' '-'` 加减是左结合的：1+2+3 == (1+2)+3 == (3+3)
* `%left '*' '/'` 乘除是左结合的：1 * 2 / 2 == (1 * 2) / 2 == (2 / 2)
* `%right '%'` 百分比是右结合的：1 / 100% == 1 / (100%)
* `%right '!'` 阶乘是右结合的，2 * 3! * 5 == 2 * (3!) * 5 == (2 * 6) * 5

优先级比较好理解，从上到下优先级依次增大。

```
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
```

### 表达式

退出表达式：expressions表示整条语句，e EOF表示栈内最后一个值遇到EOF时执行，即整条语句结束时返回栈最后一个值

```js
%% /* language grammar */

expressions
    : e EOF
        { return $1; }
    ;
```

运算表达式：e表示每一个token，可以理解为switch语法。

遇到e前遇到 '-' 表示取负，'-' e 可以理解为正则匹配：(-)(\S+) 则 $1 = '-'  $2 = 其余token。

区别于减法运算，加上%prec提升优先级：

```js
e
    : '-' e     %prec UMINUS
        {$$ = -$2;}
```

如果遇到数字，则可以使用JS中内置函数将转换后的数值压入栈中：

```js
    | NUMBER
        {$$ = Number(yytext);}
```

如果遇到常量，可以直接指定返回值，也可以使用JS中的常量：

```js
    | 'Math.E'
        {$$ = Math.E;}
    | 'PI'
        {$$ = Math.PI;}
```

可以使用前文中插入的自定义函数，例如计算阶乘，以及计算三角函数：

```js
    | e '!'
        {{$$ = fac($1);}}
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
```

括号将会被直接忽略，因为计算顺序已经指定：

```js
    | '(' e ')'
        {$$ = $2;}
```

前文中提到的设置传入是否为角度制函数，可以通过同样的方式设置。使用分号结束表达式

```js
    | 'isDeg' e
        {$$ = setIsDeg($2);}
    ;
```

⬆️ 外层代码只需要在实例中设置一次即可保存：

```js
const parser = new calculator.Parser();
let isDeg = true;
parser.parse(`isDeg(${isDeg ? 1 : 0})`);
```

## 编译代码

### 本地编译

```bash
pnpm i
pnpm make
```

```bash
npm install jison -g
jison calculator.jison -o calculator.ts
```

向 calculator.ts 尾部添加 module export

```js
export default {
    parser: calculator,
    Parser: calculator.Parser,
    parse: function () {
        return calculator.parse.apply(calculator, arguments);
    },
};
```

### 脚本编译

```bash
#!/bin/bash

cd src

mkdir -p ./output

jison jison/calculator.jison -o output/calculator.mjs

cat >> output/calculator.mjs << EOF


export default {
    parser: calculator,
    Parser: calculator.Parser,
    parse: function () {
        return calculator.parse.apply(calculator, arguments);
    },
};

EOF

content=$(cat output/calculator.mjs)
build_time=$(date '+%Y-%m-%d %H:%M:%S')

cat > output/calculator.mjs << EOF
/**
 * @file calculator.mjs
 * @description 高级计算器解析库
 * @author Steven Yan
 * @build $build_time
 *
 * 不要直接修改此文件，修改calculator.jison文件，然后使用jison编译生成此文件。
 * 代码库：https://git.steven.run/steven/jison-calculator
 * 编译器代码库：https://github.com/zaach/jison
 */

EOF

echo "$content" >> output/calculator.mjs

echo -e "\n\033[7m========> Done. ========\033[0m\n"
```
