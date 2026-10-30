#!/usr/bin/env node
/**
 * Node.js CLI calculator.
 *
 * Supported operations:
 *   add       - Addition       (a + b)
 *   subtract  - Subtraction    (a - b)
 *   multiply  - Multiplication (a * b)
 *   divide    - Division       (a / b), errors on division by zero
 *   modulo    - Remainder      (a % b), errors on division by zero
 *   power     - Exponentiation (base ** exponent)
 *   sqrt      - Square root    (single operand), errors on negative numbers
 *
 * Usage: node src/calculator.js <operation> <number1> [number2]
 * Example: node src/calculator.js add 2 3
 * Example: node src/calculator.js sqrt 16
 */

function modulo(a, b) {
  if (b === 0) {
    throw new Error('Modulo by zero is not allowed.');
  }
  return a % b;
}

function power(base, exponent) {
  return base ** exponent;
}

function squareRoot(n) {
  if (n < 0) {
    throw new Error('Square root of a negative number is not allowed.');
  }
  return Math.sqrt(n);
}

const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) {
      throw new Error('Division by zero is not allowed.');
    }
    return a / b;
  },
  modulo,
  power,
  sqrt: squareRoot,
};

const unaryOperations = new Set(['sqrt']);

function calculate(operation, a, b) {
  const fn = Object.hasOwn(operations, operation) ? operations[operation] : undefined;
  if (!fn) {
    throw new Error(
      `Unknown operation "${operation}". Supported: ${Object.keys(operations).join(', ')}.`
    );
  }
  return fn(a, b);
}

function main(args) {
  const expected = unaryOperations.has(args[0]) ? 2 : 3;
  if (args.length !== expected) {
    console.error(
      'Usage: node calculator.js <add|subtract|multiply|divide|modulo|power> <number1> <number2>\n' +
        '       node calculator.js sqrt <number>'
    );
    process.exit(1);
  }

  const [operation, rawA, rawB = '0'] = args;
  const a = Number(rawA);
  const b = Number(rawB);

  if (rawA.trim() === '' || rawB.trim() === '' || !Number.isFinite(a) || !Number.isFinite(b)) {
    console.error('Error: both operands must be valid numbers.');
    process.exit(1);
  }

  try {
    console.log(calculate(operation, a, b));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { calculate, modulo, power, squareRoot };
