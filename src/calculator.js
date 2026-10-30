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
 *   power     - Exponentiation (a ** b), requires a finite real result
 *   sqrt      - Square root    (Math.sqrt(a)), requires a non-negative number
 *
 * Usage: node src/calculator.js <operation> <number1> <number2>
 *        node src/calculator.js sqrt <number>
 * Example: node src/calculator.js add 2 3
 */

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
  modulo: (a, b) => {
    if (b === 0) {
      throw new Error('Modulo by zero is not allowed.');
    }
    return a % b;
  },
  power: (a, b) => {
    const result = a ** b;
    if (!Number.isFinite(result)) {
      throw new Error('Exponentiation must produce a finite real number.');
    }
    return result;
  },
  sqrt: (a) => {
    if (a < 0) {
      throw new Error('Square root of a negative number is not allowed.');
    }
    return Math.sqrt(a);
  },
};

function calculate(operation, a, b) {
  const fn = Object.hasOwn(operations, operation) ? operations[operation] : undefined;
  if (!fn) {
    throw new Error(
      `Unknown operation "${operation}". Supported: ${Object.keys(operations).join(', ')}.`
    );
  }
  if (!Number.isFinite(a) || (operation !== 'sqrt' && !Number.isFinite(b))) {
    throw new Error('Operands must be valid numbers.');
  }
  return fn(a, b);
}

function main(args) {
  const [operation, rawA, rawB] = args;
  if (args.length !== (operation === 'sqrt' ? 2 : 3)) {
    console.error('Usage: node calculator.js <add|subtract|multiply|divide|modulo|power> <number1> <number2>\n       node calculator.js sqrt <number>');
    process.exit(1);
  }

  const a = Number(rawA);
  const b = Number(rawB);

  if (rawA.trim() === '' || !Number.isFinite(a) ||
      (operation !== 'sqrt' && (rawB.trim() === '' || !Number.isFinite(b)))) {
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

module.exports = { calculate };
