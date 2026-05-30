import { evaluateExpression, cleanMath } from '../src/utils/math';

describe('cleanMath precision helper', () => {
  test('avoids floating point errors in basic arithmetic', () => {
    expect(cleanMath(0.1, 0.2, '+')).toBe(0.3);
    expect(cleanMath(0.3, 0.1, '-')).toBe(0.2);
    expect(cleanMath(0.1, 0.2, '×')).toBe(0.02);
    expect(cleanMath(0.3, 0.1, '÷')).toBe(3);
  });

  test('returns Error on division by zero', () => {
    expect(cleanMath(5, 0, '÷')).toBe('Error');
  });

  test('returns default operand for unrecognized operators', () => {
    expect(cleanMath(5, 10, 'invalid')).toBe(10);
  });
});

describe('evaluateExpression math parser', () => {
  describe('Basic Arithmetic', () => {
    test('handles addition, subtraction, multiplication, and division', () => {
      expect(evaluateExpression('5 + 3')).toBe('8');
      expect(evaluateExpression('10 - 4')).toBe('6');
      expect(evaluateExpression('6 × 7')).toBe('42');
      expect(evaluateExpression('12 ÷ 3')).toBe('4');
    });

    test('handles decimal values and negative numbers', () => {
      expect(evaluateExpression('1.5 + 2.25')).toBe('3.75');
      expect(evaluateExpression('-5 × 3')).toBe('-15');
      expect(evaluateExpression('10 ÷ -2')).toBe('-5');
    });

    test('respects standard operator precedence', () => {
      expect(evaluateExpression('2 + 3 × 4')).toBe('14');
      expect(evaluateExpression('(2 + 3) × 4')).toBe('20');
    });

    test('handles division by zero', () => {
      expect(evaluateExpression('5 ÷ 0')).toBe('∞');
    });
  });

  describe('Implicit Multiplication', () => {
    test('inserts implicit multiplication between numbers and parentheses', () => {
      expect(evaluateExpression('2(3)')).toBe('6');
      expect(evaluateExpression('(2)(3)')).toBe('6');
    });

    test('inserts implicit multiplication between numbers and constants or functions', () => {
      expect(parseFloat(evaluateExpression('2π'))).toBeCloseTo(6.283185307, 5);
      expect(parseFloat(evaluateExpression('3e'))).toBeCloseTo(3 * Math.E, 8);
      expect(evaluateExpression('2sin(90)', true)).toBe('2'); // sin(90 deg) = 1, 2*1 = 2
    });
  });

  describe('Auto-Closing Brackets', () => {
    test('closes unclosed parentheses automatically', () => {
      expect(evaluateExpression('(5 + 3')).toBe('8');
      expect(evaluateExpression('sin(90', true)).toBe('1');
    });
  });

  describe('Scientific Operations in Degrees', () => {
    test('evaluates trig functions in degrees', () => {
      expect(evaluateExpression('sin(90)', true)).toBe('1');
      expect(evaluateExpression('cos(0)', true)).toBe('1');
      expect(evaluateExpression('tan(45)', true)).toBe('1');
    });

    test('evaluates inverse trig functions returning degrees', () => {
      expect(evaluateExpression('sin⁻¹(1)', true)).toBe('90');
      expect(evaluateExpression('cos⁻¹(1)', true)).toBe('0');
      expect(evaluateExpression('tan⁻¹(1)', true)).toBe('45');
    });
  });

  describe('Scientific Operations in Radians', () => {
    test('evaluates trig functions in radians', () => {
      // sin(pi/2 rad) = 1
      expect(evaluateExpression('sin(π ÷ 2)', false)).toBe('1');
      // cos(0 rad) = 1
      expect(evaluateExpression('cos(0)', false)).toBe('1');
    });

    test('evaluates inverse trig functions returning radians', () => {
      // asin(1) = pi/2 rad = 1.5707963268
      expect(parseFloat(evaluateExpression('sin⁻¹(1)', false))).toBeCloseTo(Math.PI / 2, 8);
    });
  });

  describe('Other Scientific operations', () => {
    test('evaluates logs (log10 and ln)', () => {
      expect(evaluateExpression('log(100)')).toBe('2');
      expect(evaluateExpression('ln(e)')).toBe('1');
    });

    test('evaluates squares, cubes, and power function', () => {
      expect(evaluateExpression('5²')).toBe('25');
      expect(evaluateExpression('3³')).toBe('27');
      expect(evaluateExpression('2^3')).toBe('8'); // xʸ key
    });

    test('evaluates square roots and cube roots', () => {
      expect(evaluateExpression('√(16)')).toBe('4');
      expect(evaluateExpression('³√(27)')).toBe('3');
    });

    test('evaluates factorials', () => {
      expect(evaluateExpression('5!')).toBe('120');
      expect(evaluateExpression('0!')).toBe('1');
    });

    test('evaluates percentages', () => {
      expect(evaluateExpression('50%')).toBe('0.5');
      expect(evaluateExpression('10 + 20%')).toBe('10.2');
    });
  });

  describe('Error Boundaries', () => {
    test('returns Error for empty or whitespace-only inputs', () => {
      expect(evaluateExpression('')).toBe('Error');
      expect(evaluateExpression('   ')).toBe('Error');
    });

    test('returns Error for invalid syntax', () => {
      expect(evaluateExpression('5 + * 3')).toBe('Error');
      expect(evaluateExpression('sin(')).toBe('Error');
      expect(evaluateExpression('(5))')).toBe('Error'); // mismatched brackets where closing can't help
    });
  });
});
