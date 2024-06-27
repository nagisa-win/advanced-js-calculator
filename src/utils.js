const removeTrail = value => String(parseFloat(value));

module.exports.handlePrecision = value => {
    if (typeof value !== 'number') {
        value = +value;
    }

    // 12位精度
    const VALID_NUMBER = 12;

    const E_PRECISION = 8;
    const HANDLE_E_INDEX = E_PRECISION + 3;

    // 非科学计数法的模版
    let temp = String(value);
    let symbol = '';

    if (temp.startsWith('-')) {
        temp = temp.slice(1);
        symbol = '-';
    }
    const dotIndex = temp.indexOf('.');
    const eIndex = temp.indexOf('e');

    // 科学计数法的模版
    let eTemp = '';

    // 处理科学技术法
    if (eIndex > -1) {
        if (eIndex >= HANDLE_E_INDEX) {
            eTemp = value.toExponential(E_PRECISION);
        }

        // 处理非科学技术法
    } else {
        // 带小数
        if (dotIndex > -1) {
            // 匹配到e-7的情况
            const eReg = /0\.00000/;
            const match = eReg.exec(temp);

            // >e+12的情况
            if (dotIndex >= VALID_NUMBER) {
                eTemp = value.toExponential(E_PRECISION);

                // <e-7的情况
            } else if (match) {
                const fixed = Math.min(E_PRECISION, temp.length - match.index);
                eTemp = value.toExponential(fixed);

                // 保留有效位数
            } else if (temp.length > VALID_NUMBER) {
                const fixed = VALID_NUMBER - dotIndex; // 不包含.
                const newValue = Number(temp).toFixed(fixed);
                temp = removeTrail(newValue);
            }

            // 整数
        } else {
            if (temp.length >= VALID_NUMBER) {
                eTemp = value.toExponential(E_PRECISION);
            }
        }
    }

    // 对科学计数法前置数去尾0
    if (eTemp) {
        const eValueIndex = eTemp.indexOf('e');
        return removeTrail(eTemp.slice(0, eValueIndex)) + eTemp.slice(eValueIndex);
    }
    return symbol + temp;
};