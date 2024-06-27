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
 * 代码库：https://github.com/steven-dev911/advanced-js-calculator
 * 编译器代码库：https://github.com/zaach/jison
 */

EOF

echo "$content" >> output/calculator.mjs

echo -e "\n\033[7m========> Done. ========\033[0m\n"