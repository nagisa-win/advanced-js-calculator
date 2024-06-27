module.exports = [
    {
        value: '100 + 200',
        result: 300,
    },
    {
        value: 'π - 3',
        result: 0.14159265359,
    },
    {
        value: '1 + 2 × 3',
        result: 7,
    },
    {
        value: '1 + 2 × (3 - 4) ÷ 5',
        result: 0.6,
    },
    {
        value: '1 ÷ 100 %',
        result: 1,
    },
    {
        value: '0.1 * 100 %',
        result: 0.1,
    },
    {
        value: '3 ^ 4',
        result: 81,
    },
    {
        value: '√(2)',
        result: 1.41421356237,
    },
    {
        value: 'ln(e)',
        result: 1,
    },
    {
        value: 'log(1E5)',
        result: 5,
    },
    {
        value: 'sin(π / 2)',
        result: 1,
    },
    {
        value: 'cos(π / 2)',
        result: 0,
    },
    {
        value: 'tan(π / 4)',
        result: 1,
    },
    {
        value: 'asin(1 / 2)',
        result: 30,
        isDeg: true
    },
    {
        value: 'acos(1 / 2)',
        result: 60,
        isDeg: true
    },
    {
        value: 'atan(√(3))',
        result: 60,
        isDeg: true
    },
    {
        value: 'asin(1 / 2)',
        result: 0.5235987756,
    },
    {
        value: 'acos(1 / 2)',
        result: 1.0471975512,
    },
    {
        value: 'atan(√(3) / 3)',
        result: 0.5235987756,
    },
    {
        value: '((((100 ÷ 50%)% × 2 × sin(90))% × e)% ^ 2) ÷ 99.5',
        result: 1.18818993e-8,
        isDeg: true
    },
    {
        value: 'sin(30 + cos(30 * tan(60)))',
        result: 0.50928462191,
        isDeg: true
    },
    {
        value: 'sin(30)+cos(45)',
        result: 1.20710678119,
        isDeg: true
    },
    {
        value: 'ln(e) + log(1E9)',
        result: 10,
    },
    {
        value: 'sin(π / 2) / cos(π / 2)',
        result: 'Error',
    },
    {
        value: '0√(4) / 3',
        result: 'Infinity',
    },
    {
        value: 'tan(tan(tan(tan(π))))',
        result: 0,
    },
    {
        value: '3^3! + 3!',
        result: 735,
    },
    {
        value: '(3 + 3!)!',
        result: 362880,
    },
    {
        value: 'ln(e^3)!',
        result: 6,
    },
    {
        value: '9 ÷ cos(25^6) - ln(e)! + ln(tan(21))',
        result: 'NaN',
    },
    {
        value: '9 % ^6 × tan(61.2) + π^5 ÷ 0.64595729300 - √(5.2 × 6! + 3.1^9)',
        result: 300.011666686,
    },
    {
        value: '√(log(23) + 3! × 9 % ) - 63.1 × tan(2! × e)',
        result: 72.7202938705
    },
    {
        value: '-2^2^3',
        result: -256
    },
    {
        value: '1 + ( - 2^6)',
        result: -63
    }
];