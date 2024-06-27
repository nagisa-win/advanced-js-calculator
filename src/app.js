const calculator = require('./calculator.js');
const tests = require('./test_cases.js');
const {handlePrecision} = require('./utils.js');

const parser = new calculator.Parser();

function calc(exp, isDeg = false) {
    exp = exp.replace(/E/g, 'e');
    exp = exp.replace(/\be\b/g, 'Math.E');

    parser.parse(`isDeg(${isDeg * 1})`);

    const stack = [];
    let res = [];
    for (let i = 0; i < exp.length; i++) {
        const val = exp[i];
        if (val !== ')') {
            stack.push(val);
        } else {
            let v = stack.pop();
            while (v !== '(') {
                res.unshift(v);
                v = stack.pop();
            }
            stack.push(' ');
            const resNum = res.join('');
            if (res.length === 1 || !isNaN(resNum)) {
                stack.push(resNum);
            } else {
                stack.push(parser.parse(resNum) + '');
            }
            res = [];
        }
    }
    const stackStr = stack.join('');
    console.log(stackStr);
    return handlePrecision(parser.parse(stackStr));
}


function print(tests) {
    if (Array.isArray(tests)) {
        const prints = [];
        tests.forEach(v => {
            let ans = '';
            try {
                ans = calc(v.value, v.isDeg);
            } catch {
                ans = 'Error';
            }
            const expect = String(v.result);
            const o = {
                isDeg: v.isDeg ? 1 : 0,
                exp: v.value,
                result: ans,
                expect: expect,
                correct: ans === expect ? true : '✘',
            };
            prints.push(o);
        });
        console.table(prints);
        return;
    }
    console.log(calc(tests));
}

print(tests);