import { evaluate, pi, e, factorial, sqrt, log, log10, pow, sin, cos, tan, asin, acos, atan, cbrt } from 'mathjs';

/**
 * Precision math helper to avoid floating point errors (e.g. 0.1 + 0.2 = 0.3)
 */
export const cleanMath = (a: number, b: number, op: string): number | string => {
  switch (op) {
    case '+':
      return Math.round((a + b) * 1e10) / 1e10;
    case '-':
      return Math.round((a - b) * 1e10) / 1e10;
    case '×':
      return Math.round((a * b) * 1e10) / 1e10;
    case '÷':
      return b === 0 ? 'Error' : Math.round((a / b) * 1e10) / 1e10;
    default:
      return b;
  }
};

/**
 * Converts UI display symbols into mathjs-compatible expressions
 * and evaluates the full expression string.
 *
 * @param expr - The expression string from the calculator display
 * @param useDegrees - If true, trig functions operate in degrees (default: true)
 * @returns The result as a formatted string, or 'Error' on invalid input
 */
export const evaluateExpression = (expr: string, useDegrees: boolean = true): string => {
  try {
    if (!expr || expr.trim() === '') {
      return 'Error';
    }

    let processed = expr;

    // Replace UI symbols with mathjs syntax
    processed = processed.replace(/×/g, '*');
    processed = processed.replace(/÷/g, '/');
    processed = processed.replace(/π/g, `(${pi})`);
    processed = processed.replace(/e/g, `(${e})`);

    // Replace ³√ first to prevent ³ and √ from consuming it
    processed = processed.replace(/³√\(/g, 'cbrt(');
    processed = processed.replace(/²/g, '^2');
    processed = processed.replace(/³/g, '^3');

    // Replace UI function symbols with standard mathjs function names
    processed = processed.replace(/sin⁻¹\(/g, 'asin(');
    processed = processed.replace(/cos⁻¹\(/g, 'acos(');
    processed = processed.replace(/tan⁻¹\(/g, 'atan(');

    // Replace log first, then ln, to prevent log replacing ln's output
    processed = processed.replace(/log\(/g, '__LOGTEN__(');
    processed = processed.replace(/ln\(/g, 'log(');

    processed = processed.replace(/√\(/g, 'sqrt(');

    // Handle percentage: convert standalone % to /100
    processed = processed.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

    // Handle factorial: convert n! to factorial(n)
    processed = processed.replace(/(\d+(?:\.\d+)?)\!/g, 'factorial($1)');
    processed = processed.replace(/\)!/g, ')'); // Handle (expr)! — user needs to wrap

    // Handle implicit multiplication: 2( -> 2*(, )( -> )*(, 2sin -> 2*sin etc.
    processed = processed.replace(/(\d)\(/g, '$1*(');
    processed = processed.replace(/\)\(/g, ')*(');

    const implicitMultiplierTargets = 'sin|cos|tan|asin|acos|atan|log|__LOGTEN__|sqrt|cbrt|factorial|pi|e';
    const targetRegex1 = new RegExp(`(\\d)(${implicitMultiplierTargets})`, 'g');
    const targetRegex2 = new RegExp(`\\)(${implicitMultiplierTargets})`, 'g');
    processed = processed.replace(targetRegex1, '$1*$2');
    processed = processed.replace(targetRegex2, ')*$1');

    // Restore placeholder log10
    processed = processed.replace(/__LOGTEN__/g, 'log10');

    // Auto-close unclosed brackets
    const openCount = (processed.match(/\(/g) || []).length;
    const closeCount = (processed.match(/\)/g) || []).length;
    if (openCount > closeCount) {
      processed += ')'.repeat(openCount - closeCount);
    }

    // Set custom scope for degree/radian evaluations if needed
    const scope: any = {};
    if (useDegrees) {
      scope.sin = (x: number) => sin(x * (pi as any) / 180);
      scope.cos = (x: number) => cos(x * (pi as any) / 180);
      scope.tan = (x: number) => tan(x * (pi as any) / 180);
      scope.asin = (x: number) => (asin(x) as any) * 180 / (pi as any);
      scope.acos = (x: number) => (acos(x) as any) * 180 / (pi as any);
      scope.atan = (x: number) => (atan(x) as any) * 180 / (pi as any);
    }

    // Evaluate
    const result = evaluate(processed, scope);

    // Handle special results
    if (result === undefined || result === null) {
      return 'Error';
    }

    if (typeof result === 'number') {
      if (isNaN(result)) {
        return 'Error';
      }
      if (!isFinite(result)) {
        return result === Infinity ? '∞' : '-∞';
      }

      // Format: cap to 10 decimal places, strip trailing zeros
      const formatted = parseFloat(result.toFixed(10));
      return formatted.toString();
    }

    // mathjs can return other types (matrices, etc.)
    return result.toString();
  } catch (error) {
    return 'Error';
  }
};
