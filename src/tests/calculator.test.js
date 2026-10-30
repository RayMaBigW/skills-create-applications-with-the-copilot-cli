const path = require('path');
const { spawnSync } = require('child_process');
const { calculate } = require('../calculator');

const CLI = path.join(__dirname, '..', 'calculator.js');
const run = (...args) => spawnSync('node', [CLI, ...args], { encoding: 'utf8' });

describe('addition', () => {
  test('2 + 3 = 5', () => expect(calculate('add', 2, 3)).toBe(5));
  test('negative numbers', () => expect(calculate('add', -2, -3)).toBe(-5));
  test('mixed signs', () => expect(calculate('add', -2, 3)).toBe(1));
  test('decimals', () => expect(calculate('add', 0.5, 0.25)).toBe(0.75));
  test('adding zero', () => expect(calculate('add', 7, 0)).toBe(7));
});

describe('subtraction', () => {
  test('10 - 4 = 6', () => expect(calculate('subtract', 10, 4)).toBe(6));
  test('negative result', () => expect(calculate('subtract', 4, 10)).toBe(-6));
  test('negative operand', () => expect(calculate('subtract', 5, -3)).toBe(8));
  test('decimals', () => expect(calculate('subtract', 1.5, 0.5)).toBe(1));
  test('subtracting zero', () => expect(calculate('subtract', 7, 0)).toBe(7));
});

describe('multiplication', () => {
  test('45 * 2 = 90', () => expect(calculate('multiply', 45, 2)).toBe(90));
  test('by zero', () => expect(calculate('multiply', 9, 0)).toBe(0));
  test('negative numbers', () => expect(calculate('multiply', -4, -3)).toBe(12));
  test('mixed signs', () => expect(calculate('multiply', -4, 3)).toBe(-12));
  test('decimals', () => expect(calculate('multiply', 2.5, 4)).toBe(10));
});

describe('division', () => {
  test('20 / 5 = 4', () => expect(calculate('divide', 20, 5)).toBe(4));
  test('fractional result', () => expect(calculate('divide', 6, 4)).toBe(1.5));
  test('negative numbers', () => expect(calculate('divide', -20, -5)).toBe(4));
  test('mixed signs', () => expect(calculate('divide', -20, 5)).toBe(-4));
  test('zero numerator', () => expect(calculate('divide', 0, 5)).toBe(0));
  test('division by zero throws', () => {
    expect(() => calculate('divide', 1, 0)).toThrow('Division by zero');
  });
});

describe('modulo', () => {
  test.each([
    [10, 3, 1],
    [10, 2, 0],
    [-10, 3, -1],
    [10, -3, 1],
    [5.5, 2, 1.5],
    [0, 3, 0],
  ])('%s %% %s = %s', (a, b, expected) => {
    expect(calculate('modulo', a, b)).toBe(expected);
  });

  test.each([0, -0])('zero divisor %s throws', (b) => {
    expect(() => calculate('modulo', 1, b)).toThrow('Modulo by zero');
  });
});

describe('power', () => {
  test.each([
    [2, 3, 8],
    [2, 0, 1],
    [0, 0, 1],
    [0, 2, 0],
    [2, -2, 0.25],
    [-2, 3, -8],
    [9, 0.5, 3],
  ])('%s ** %s = %s', (a, b, expected) => {
    expect(calculate('power', a, b)).toBe(expected);
  });

  test.each([[0, -1], [-1, 0.5], [10, 1000]])(
    'rejects non-finite result for %s ** %s',
    (a, b) => {
      expect(() => calculate('power', a, b)).toThrow('finite real number');
    }
  );
});

describe('square root', () => {
  test.each([[9, 3], [0, 0], [0.25, 0.5]])('sqrt(%s) = %s', (a, expected) => {
    expect(calculate('sqrt', a)).toBe(expected);
  });

  test('irrational result', () => expect(calculate('sqrt', 2)).toBeCloseTo(Math.SQRT2));
  test('negative operand throws', () => {
    expect(() => calculate('sqrt', -1)).toThrow('Square root of a negative number');
  });
});

describe('invalid operands', () => {
  test.each(['modulo', 'power', 'sqrt'])('%s rejects invalid numbers', (operation) => {
    for (const value of [NaN, Infinity, -Infinity, undefined, '2', null]) {
      expect(() => calculate(operation, value, 2)).toThrow('valid numbers');
      if (operation !== 'sqrt') {
        expect(() => calculate(operation, 2, value)).toThrow('valid numbers');
      }
    }
  });
});

describe('invalid operation', () => {
  test('unknown operation throws', () => {
    expect(() => calculate('pow', 2, 3)).toThrow('Unknown operation');
  });
  test('inherited property names are not operations', () => {
    expect(() => calculate('toString', 2, 3)).toThrow('Unknown operation');
  });
});

describe('CLI', () => {
  test.each([
    [['add', '2', '3'], '5'],
    [['subtract', '10', '4'], '6'],
    [['multiply', '45', '2'], '90'],
    [['divide', '20', '5'], '4'],
    [['modulo', '10', '3'], '1'],
    [['power', '2', '3'], '8'],
    [['power', '2', '-2'], '0.25'],
    [['sqrt', '9'], '3'],
    [['sqrt', '0'], '0'],
  ])('%j prints %s', (args, expected) => {
    const r = run(...args);
    expect(r.status).toBe(0);
    expect(r.stdout.trim()).toBe(expected);
  });

  test('division by zero exits with error', () => {
    const r = run('divide', '1', '0');
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/Division by zero/);
  });

  test.each([
    [['modulo', '1', '0'], /Modulo by zero/],
    [['power', '-1', '0.5'], /finite real number/],
    [['power', '10', '1000'], /finite real number/],
    [['power', '0', '-1'], /finite real number/],
    [['sqrt', '-1'], /Square root of a negative number/],
    [['sqrt', 'abc'], /valid numbers/],
    [['sqrt', ''], /valid numbers/],
    [['sqrt', 'Infinity'], /valid numbers/],
    [['modulo', '1', 'NaN'], /valid numbers/],
    [['power', '2', 'Infinity'], /valid numbers/],
    [['sqrt'], /Usage/],
    [['sqrt', '9', '2'], /Usage/],
    [['modulo', '2'], /Usage/],
    [['power', '2'], /Usage/],
  ])('%j exits with an error', (args, message) => {
    const r = run(...args);
    expect(r.status).toBe(1);
    expect(r.stdout).toBe('');
    expect(r.stderr).toMatch(message);
  });

  test('non-numeric operand exits with error', () => {
    const r = run('add', 'a', '2');
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/valid numbers/);
  });

  test('wrong argument count prints usage', () => {
    const r = run('add', '1');
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/Usage/);
  });
});
