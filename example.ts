import { Milton, pretty, ansiColors } from './src/';

const milton = new Milton();
milton.use(pretty);

const obj = {
  null: null,
  numbers: [
    3.14159,
    NaN,
    Infinity,
    -Infinity,
    -0,
    -10000000000000006n
  ],
  strings: {
    empty: '',
    string: 'foo',
    multiline: `
    This
    is
    multiline
    `
  },
  arrays: {
    empty: [],
    array: [ 'one', 'two', 'three' ]
  },
  nested: { hello: 'hapi' },
  false: false,
  true: true,
  undef: undefined,
  error: new Error('bad'),
  regexp: /.*\n/g,
  symbol: Symbol('Waddams'),
  function: function Yes() { /* noop */ },
  map: new Map([['key1', 'value1'], ['key2', 'value2']]),
  set: new Set([1, 2, 3]),
  date: new Date('1995-12-17T03:24:00'),
  objects: {
    class: Milton,
    instance: milton
  }
};

const stringified = milton.stringify(obj);
console.log(stringified);

milton.add(ansiColors);

const colorized = milton.stringify(obj);
console.log(colorized);
