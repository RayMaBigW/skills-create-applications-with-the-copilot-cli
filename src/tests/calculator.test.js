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
