import { useState, useEffect, useCallback } from 'react';
import { evaluateExpression } from '../utils/math';
import {
  HistoryEntry,
  loadHistory,
  addHistoryEntry,
  clearAllHistory,
} from '../utils/historyStorage';

export interface UseCalculatorReturn {
  expression: string;
  result: string;
  history: HistoryEntry[];
  useDegrees: boolean;
  isAllClear: boolean;
  // Actions
  pressDigit: (d: string) => void;
  pressOperator: (op: string) => void;
  pressScientific: (fn: string) => void;
  pressBracket: (bracket: '(' | ')') => void;
  pressDecimal: () => void;
  pressEquals: () => void;
  pressClear: () => void;
  pressBackspace: () => void;
  pressPercentage: () => void;
  pressNegate: () => void;
  toggleAngleMode: () => void;
  clearHistory: () => void;
  restoreFromHistory: (entry: HistoryEntry) => void;
}

export const useCalculator = (): UseCalculatorReturn => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [useDegrees, setUseDegrees] = useState(true);
  const [justEvaluated, setJustEvaluated] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  // Live preview: evaluate partial expression as user types
  useEffect(() => {
    if (expression.length > 0 && !justEvaluated) {
      const preview = evaluateExpression(expression, useDegrees);
      if (preview !== 'Error') {
        setResult(preview);
      }
    }
  }, [expression, useDegrees, justEvaluated]);

  const isAllClear = expression === '' && result === '0';

  // Determine if the last character is a digit or closing paren
  const lastChar = expression.slice(-1);
  const isLastDigitOrClose = /[\d\)πe²!%]/.test(lastChar);

  const pressDigit = useCallback((d: string) => {
    if (justEvaluated) {
      // Start fresh expression with the new digit
      setExpression(d);
      setResult(d);
      setJustEvaluated(false);
      return;
    }
    setExpression(prev => prev + d);
  }, [justEvaluated]);

  const pressOperator = useCallback((op: string) => {
    setJustEvaluated(false);
    if (expression === '' && result !== '0' && result !== 'Error') {
      // Continue from previous result
      setExpression(result + ' ' + op + ' ');
      return;
    }
    if (expression === '') return;

    // Replace trailing operator with new one
    const trimmed = expression.trimEnd();
    const lastCharTrimmed = trimmed.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastCharTrimmed)) {
      setExpression(trimmed.slice(0, -1) + op + ' ');
      return;
    }

    setExpression(prev => prev + ' ' + op + ' ');
  }, [expression, result, justEvaluated]);

  const pressScientific = useCallback((fn: string) => {
    setJustEvaluated(false);

    switch (fn) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'sin⁻¹':
      case 'cos⁻¹':
      case 'tan⁻¹':
      case 'log':
      case 'ln':
      case '√':
      case '³√':
        if (justEvaluated) {
          setExpression(
            fn === '√'
              ? '√(' + result + ')'
              : fn === '³√'
              ? '³√(' + result + ')'
              : fn + '(' + result + ')'
          );
          setJustEvaluated(false);
        } else {
          setExpression(
            prev =>
              prev +
              (fn === '√'
                ? '√('
                : fn === '³√'
                ? '³√('
                : fn + '(')
          );
        }
        break;
      case 'x²':
        if (justEvaluated) {
          setExpression(result + '²');
          setJustEvaluated(false);
        } else {
          setExpression(prev => prev + '²');
        }
        break;
      case 'x³':
        if (justEvaluated) {
          setExpression(result + '³');
          setJustEvaluated(false);
        } else {
          setExpression(prev => prev + '³');
        }
        break;
      case 'xʸ':
        if (justEvaluated) {
          setExpression(result + '^');
          setJustEvaluated(false);
        } else {
          setExpression(prev => prev + '^');
        }
        break;
      case '10ˣ':
        if (justEvaluated) {
          setExpression('10^(' + result + ')');
          setJustEvaluated(false);
        } else {
          setExpression(prev => prev + '10^(');
        }
        break;
      case 'eˣ':
        if (justEvaluated) {
          setExpression('e^(' + result + ')');
          setJustEvaluated(false);
        } else {
          setExpression(prev => prev + 'e^(');
        }
        break;
      case 'π':
        if (justEvaluated) {
          setExpression('π');
          setJustEvaluated(false);
        } else {
          setExpression(prev => prev + 'π');
        }
        break;
      case 'e':
        if (justEvaluated) {
          setExpression('e');
          setJustEvaluated(false);
        } else {
          setExpression(prev => prev + 'e');
        }
        break;
      case 'n!':
        if (justEvaluated) {
          setExpression(result + '!');
          setJustEvaluated(false);
        } else {
          setExpression(prev => prev + '!');
        }
        break;
      default:
        break;
    }
  }, [justEvaluated, result]);

  const pressBracket = useCallback((bracket: '(' | ')') => {
    if (justEvaluated && bracket === '(') {
      setExpression('(');
      setJustEvaluated(false);
      return;
    }
    setJustEvaluated(false);
    setExpression(prev => prev + bracket);
  }, [justEvaluated]);

  const pressDecimal = useCallback(() => {
    if (justEvaluated) {
      setExpression('0.');
      setResult('0.');
      setJustEvaluated(false);
      return;
    }

    // Find the last number token in the expression
    const tokens = expression.split(/[\+\-×÷\(\)\s]/);
    const lastToken = tokens[tokens.length - 1] || '';

    // Don't add another decimal if the last number already has one
    if (lastToken.includes('.')) return;

    if (expression === '' || /[\+\-×÷\(\s]$/.test(expression)) {
      setExpression(prev => prev + '0.');
    } else {
      setExpression(prev => prev + '.');
    }
  }, [expression, justEvaluated]);

  const pressEquals = useCallback(async () => {
    if (expression === '') return;

    const evalResult = evaluateExpression(expression, useDegrees);
    setResult(evalResult);
    setJustEvaluated(true);

    // Save to history if successful
    if (evalResult !== 'Error') {
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        expression: expression,
        result: evalResult,
        timestamp: Date.now(),
      };
      const updated = await addHistoryEntry(entry);
      setHistory(updated);
    }
  }, [expression, useDegrees]);

  const pressClear = useCallback(() => {
    setExpression('');
    setResult('0');
    setJustEvaluated(false);
  }, []);

  const pressBackspace = useCallback(() => {
    if (justEvaluated) {
      // After evaluation, clear everything
      setExpression('');
      setResult('0');
      setJustEvaluated(false);
      return;
    }

    if (expression.length === 0) return;

    // Check for multi-char tokens at the end: sin⁻¹(, cos⁻¹(, tan⁻¹(, sin(, cos(, tan(, log(, ln(, √(, ³√(, 10^(, e^(
    const funcPatterns = [
      'sin⁻¹(',
      'cos⁻¹(',
      'tan⁻¹(',
      'sin(',
      'cos(',
      'tan(',
      'log(',
      'ln(',
      '√(',
      '³√(',
      '10^(',
      'e^(',
    ];
    for (const pattern of funcPatterns) {
      if (expression.endsWith(pattern)) {
        setExpression(prev => prev.slice(0, -pattern.length));
        return;
      }
    }

    // Remove trailing spaces along with the character
    let newExpr = expression;
    if (newExpr.endsWith(' ')) {
      newExpr = newExpr.trimEnd();
    }
    newExpr = newExpr.slice(0, -1).trimEnd();

    setExpression(newExpr);
    if (newExpr === '') {
      setResult('0');
    }
  }, [expression, justEvaluated]);

  const pressPercentage = useCallback(() => {
    if (expression === '' && result !== '0' && result !== 'Error') {
      const percentVal = parseFloat(result) / 100;
      setExpression(percentVal.toString());
      setResult(percentVal.toString());
      setJustEvaluated(false);
      return;
    }
    setExpression(prev => prev + '%');
    setJustEvaluated(false);
  }, [expression, result]);

  const pressNegate = useCallback(() => {
    if (justEvaluated && result !== '0' && result !== 'Error') {
      const negated = result.startsWith('-') ? result.slice(1) : '-' + result;
      setExpression(negated);
      setResult(negated);
      setJustEvaluated(false);
      return;
    }

    if (expression === '') return;

    // Try to negate the last number in the expression
    if (expression.startsWith('-')) {
      setExpression(prev => prev.slice(1));
    } else {
      setExpression(prev => '(-' + prev + ')');
    }
  }, [expression, result, justEvaluated]);

  const toggleAngleMode = useCallback(() => {
    setUseDegrees(prev => !prev);
  }, []);

  const clearHistoryHandler = useCallback(async () => {
    await clearAllHistory();
    setHistory([]);
  }, []);

  const restoreFromHistory = useCallback((entry: HistoryEntry) => {
    setExpression(entry.expression);
    setResult(entry.result);
    setJustEvaluated(false);
  }, []);

  return {
    expression,
    result,
    history,
    useDegrees,
    isAllClear,
    pressDigit,
    pressOperator,
    pressScientific,
    pressBracket,
    pressDecimal,
    pressEquals,
    pressClear,
    pressBackspace,
    pressPercentage,
    pressNegate,
    toggleAngleMode,
    clearHistory: clearHistoryHandler,
    restoreFromHistory,
  };
};
