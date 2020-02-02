import Chalk from 'chalk';

// tslint:disable:no-expression-statement
import { Milton } from './milton';
import { ansiColors } from './plugins';
import { json, js, pretty } from './presets';

const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent fermentum suscipit hendrerit. In elit urna, suscipit sed auctor et, maximus eget nibh. Duis sollicitudin odio nisi, eu eleifend nunc molestie non. Curabitur dignissim viverra ullamcorper. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Praesent faucibus at mauris sed lacinia. Morbi tincidunt purus non facilisis lobortis. Donec molestie massa eu lacus dictum eleifend. Suspendisse vel dolor laoreet diam congue hendrerit. Aenean sed luctus lacus, ultricies faucibus dolor.';
const bigarray = Array.from({ length: 100 }).map((_k, i) => i * 1.1);

class Foo {
  constructor(public value: string, private _value: string) {}

  get() {
    return this._value;
  }
}

const a = new Foo('Hello', 'World');

const obj: any = {
  json: {
    null: null,
    integer: 1580349408812,
    float: 0.4852754432812123,
    strings: {
      empty: '',
      string: 'foo',
      multiline: `
        This
        is
        multiline
      `,
      longText
    },
    arrays: {
      empty: [],
      array: ['one', 'two', 'three'],
      bigarray
      // sparse: [1, , 3, , 5]
    },
    nested: { hello: 'hapi' },
    booleans: {
      false: false,
      true: true
    }
  },
  otherTypes: {
    // tslint:disable-next-line: object-literal-shorthand
    undefined: undefined,
    error: new Error('bad'),
    regexp: /.*\n/g,
    symbol: Symbol('Waddams'),
    function: function Yes() {
      /* noop */
    },
    map: new Map([
      ['key1', 'value1'],
      ['key2', 'value2']
    ]),
    set: new Set([1, 2, 3]),
    date: new Date('1995-12-17T03:24:00'),
    numbers: [NaN, Infinity, -Infinity, -0],
    void: void 0
    // buffer: Buffer.from("Hello"),
    // bigint: 123n,
    // promise: Promise.resolve(123)
  },
  objects: {
    class: Foo,
    instance: a
    // circ: circularObj,
    // circArr: circularArr
  },
  // boxed: {
  //   number: new Number(123),
  //   string: new String('abc'),
  //   boolean: new Boolean(true)
  // },
  deep: {
    a: {
      b: {
        c: {
          d: {
            e: [{ f: [] }]
          }
        }
      }
    }
  },
  weird: {
    'a\t\n\n\tb': 'value'
  }
};

test('milton thows without plugins', () => {
  const milton = new Milton();
  expect(() => {
    milton.stringify('');
  }).toThrow('PC LOAD LETTER');
});

describe('json', () => {
  const milton = new Milton();
  milton.use(json);

  test('jsonValues', () => {
    expect(milton.stringify('')).toBe(`""`);
    expect(milton.stringify('Hello')).toBe(`"Hello"`);
    expect(milton.stringify(longText)).toBe(`"${longText}"`);
    expect(milton.stringify(3.14)).toBe(`3.14`);
    expect(milton.stringify(true)).toBe(`true`);
    expect(milton.stringify(false)).toBe(`false`);
    expect(milton.stringify(null)).toBe(`null`);
  });

  test('arrays', () => {
    expect(milton.stringify([])).toBe(JSON.stringify([], undefined, 2));
    expect(milton.stringify(['Hello', 3.14])).toBe(
      JSON.stringify(['Hello', 3.14])
    );
    expect(milton.stringify([['Hello'], 3.14])).toBe(
      JSON.stringify([['Hello'], 3.14])
    );

    expect(milton.stringify(bigarray)).toBe(
      JSON.stringify(bigarray, undefined, 2)
    );
  });

  test('objects', () => {
    expect(milton.stringify({})).toBe(JSON.stringify({}));
    expect(milton.stringify({ Hello: 3.14 })).toBe(
      JSON.stringify({ Hello: 3.14 })
    );
    expect(milton.stringify({ Hello: { pi: 3.14 } })).toBe(
      JSON.stringify({ Hello: { pi: 3.14 } })
    );
    expect(milton.stringify({ Hello: [3.14] })).toBe(
      JSON.stringify({ Hello: [3.14] })
    );
  });

  test('js objects', () => {
    expect(milton.stringify(new Date('1995-12-17T03:24:00'))).toBe(
      `"1995-12-17T10:24:00.000Z"`
    );
    expect(milton.stringify(/\.*/g)).toBe(`{}`);
    expect(milton.stringify(Symbol('Milton'))).toBe(undefined);
    expect(
      milton.stringify(function yes() {
        return true;
      })
    ).toBe(undefined);
    expect(milton.stringify(new Error('bad'))).toBe(`{}`);
    expect(milton.stringify(new Set([1, 2, 3]))).toBe(`{}`);
    expect(
      milton.stringify(
        new Map([
          ['key1', 'value1'],
          ['key2', 'value2']
        ])
      )
    ).toBe(`{}`);
  });

  test('circular throws', () => {
    expect(() => {
      const b: any = {};
      b.a = b;
      milton.stringify(b);
    }).toThrow('Converting circular structure to JSON');
  });

  test('snapshot', () => {
    expect(milton.stringify(obj)).toMatchSnapshot();
  });
});

describe('js objects', () => {
  const milton = new Milton();
  milton.use(js);

  test('jsonValues', () => {
    expect(milton.stringify('')).toBe(`''`);
    expect(milton.stringify('Hello')).toBe(`'Hello'`);
    expect(milton.stringify(longText)).toBe(`'${longText}'`);
    expect(milton.stringify(3.14)).toBe(`3.14`);
    expect(milton.stringify(true)).toBe(`true`);
    expect(milton.stringify(false)).toBe(`false`);
    expect(milton.stringify(null)).toBe(`null`);
  });

  test('jsValues', () => {
    expect(milton.stringify(undefined)).toBe(`undefined`);
    expect(milton.stringify(NaN)).toBe(`NaN`);
    expect(milton.stringify(Infinity)).toBe(`Infinity`);
    expect(milton.stringify(-Infinity)).toBe(`-Infinity`);
    expect(milton.stringify(-0)).toBe(`-0`);
    expect(milton.stringify(123n)).toBe(`123n`);
    expect(milton.stringify(-100000000000000005n)).toBe(`-100000000000000005n`);
    expect(milton.stringify(BigInt('-100000000000000006'))).toBe(
      `-100000000000000006n`
    );
  });

  test('arrays', () => {
    expect(milton.stringify([])).toBe(JSON.stringify([], undefined, 2));
    expect(milton.stringify(['Hello', 3.14])).toBe(`['Hello',3.14]`);
    expect(milton.stringify([['Hello'], 3.14])).toBe(`[['Hello'],3.14]`);

    expect(milton.stringify(bigarray)).toBe(
      JSON.stringify(bigarray, undefined, 2)
    );
  });

  test('objects', () => {
    expect(milton.stringify({})).toBe(JSON.stringify({}));
    expect(milton.stringify({ Hello: 3.14 })).toBe(
      JSON.stringify({ Hello: 3.14 })
    );
    expect(milton.stringify({ Hello: { pi: 3.14 } })).toBe(
      JSON.stringify({ Hello: { pi: 3.14 } })
    );
    expect(milton.stringify({ Hello: [3.14] })).toBe(
      JSON.stringify({ Hello: [3.14] })
    );
  });

  test('js objects', () => {
    expect(milton.stringify(new Date('1995-12-17T03:24:00'))).toBe(
      `new Date('1995-12-17T10:24:00.000Z')`
    );
    expect(milton.stringify(/\.*/g)).toBe(`new RegExp('\\\\.*', 'g')`);
    expect(milton.stringify(Symbol('Milton'))).toBe(`Symbol('Milton')`);
    // expect(milton.stringify(function yes() { return true; })).toBe(`[ƒ: yes]`);
    expect(milton.stringify(new Error('bad'))).toBe(`new Error('bad')`);
    expect(milton.stringify(new Set([1, 2, 3]))).toBe(`new Set([1,2,3])`);
    expect(
      milton.stringify(
        new Map([
          ['key1', 'value1'],
          ['key2', 'value2']
        ])
      )
    ).toBe(`new Map([['key1','value1'],['key2','value2']])`);
  });

  test('long arrays', () => {
    expect(milton.stringify(bigarray)).toBe(
      JSON.stringify(bigarray, undefined, 2)
    );
  });

  test('snapshot', () => {
    expect(milton.stringify(obj)).toMatchSnapshot();
  });
});

describe('pretty', () => {
  const milton = new Milton();
  milton.use(pretty);

  test('jsonValues', () => {
    expect(milton.stringify('')).toBe(`''`);
    expect(milton.stringify('Hello')).toBe(`'Hello'`);
    expect(milton.stringify(longText)).toBe(
      `'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent fer ... us dolor.'`
    );
    expect(milton.stringify(3.14)).toBe(`3.14`);
    expect(milton.stringify(true)).toBe(`true`);
    expect(milton.stringify(false)).toBe(`false`);
    expect(milton.stringify(null)).toBe(`null`);
  });

  test('jsValues', () => {
    expect(milton.stringify(undefined)).toBe(`undefined`);
    expect(milton.stringify(NaN)).toBe(`NaN`);
    expect(milton.stringify(Infinity)).toBe(`Infinity`);
    expect(milton.stringify(-Infinity)).toBe(`-Infinity`);
    expect(milton.stringify(-0)).toBe(`-0`);
    expect(milton.stringify(123n)).toBe(`123n`);
    expect(milton.stringify(-100000000000000005n)).toBe(`-100000000000000005n`);
    expect(milton.stringify(BigInt('-100000000000000006'))).toBe(
      `-100000000000000006n`
    );
  });

  test('arrays', () => {
    expect(milton.stringify([])).toBe(`[ ]`);
    expect(milton.stringify(['Hello', 3.14])).toBe(`[ 'Hello', 3.14 ]`);
    expect(milton.stringify([['Hello'], 3.14])).toBe(`[ [ 'Hello' ], 3.14 ]`);
  });

  test('objects', () => {
    expect(milton.stringify({})).toBe(`{ }`);
    expect(milton.stringify({ Hello: 3.14 })).toBe(`{ Hello: 3.14 }`);
    expect(milton.stringify({ Hello: { pi: 3.14 } })).toBe(
      `{ Hello: { pi: 3.14 } }`
    );
    expect(milton.stringify({ Hello: [3.14] })).toBe(`{ Hello: [ 3.14 ] }`);
  });

  test('circular objects', () => {
    const b: any = {
      a: {}
    };
    b.a.a = b.a;

    expect(milton.stringify(b)).toBe(`{ a: { a: [Reference #/a] } }`);
  });

  test('js objects', () => {
    expect(milton.stringify(new Date('1995-12-17T03:24:00'))).toBe(
      new Date('1995-12-17T10:24:00.000Z').toString()
    );
    expect(milton.stringify(/\.*/g)).toBe(`/\\.*/g`);
    expect(milton.stringify(Symbol('Milton'))).toBe(`Symbol(Milton)`);
    expect(
      milton.stringify(function yes() {
        return true;
      })
    ).toBe(`[ƒ yes]`);
    expect(milton.stringify(new Error('bad'))).toBe(`Error: bad`);
    expect(milton.stringify(new Set([1, 2, 3]))).toBe(`Set(3) { 1, 2, 3 }`);
    expect(
      milton.stringify(
        new Map([
          ['key1', 'value1'],
          ['key2', 'value2']
        ])
      )
    ).toBe(`Map(2) { key1 => 'value1', key2 => 'value2' }`);
  });

  test('weak', () => {
    expect(milton.stringify(new WeakSet([{}, {}, {}]))).toBe(`WeakSet {}`);
    expect(
      milton.stringify(
        new WeakMap([
          [{}, {}],
          [{}, {}]
        ])
      )
    ).toBe(`WeakMap {}`);
  });

  test('Promises', () => {
    expect(milton.stringify(Promise.resolve('Hello'))).toBe(`Promise { ? }`);
  });

  test('classes and instances', () => {
    expect(milton.stringify(Foo)).toBe(`[class: Foo]`);
    expect(milton.stringify(a)).toBe(`Foo { value: 'Hello' }`);
  });

  test('more and depth', () => {
    const s = '[\n  ' + bigarray.slice(0, 19).join(',\n  ') + ',\n  ...\n]';
    expect(milton.stringify(bigarray)).toBe(s);

    const deep = {
      b: {
        c: {
          d: {
            e: {}
          }
        }
      }
    };

    expect(milton.stringify(deep)).toBe('{ b: { c: { d: { e: {...} } } } }');

    const arr = [[[[[[[[['Hello']]]]]]]]];
    expect(milton.stringify(arr)).toBe('[ [ [ [ Array(1) ] ] ] ]');
  });

  test('snapshot', () => {
    expect(milton.stringify(obj)).toMatchSnapshot();
  });
});

describe('prettyColors', () => {
  const milton = new Milton();
  milton.use(pretty);
  milton.add(ansiColors);

  test('jsonValues', () => {
    expect(milton.stringify('')).toBe(Chalk.yellow(`''`));
    expect(milton.stringify('Hello')).toBe(Chalk.yellow(`'Hello'`));
    expect(milton.stringify(longText)).toBe(
      Chalk.yellow(
        `'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent fer ... us dolor.'`
      )
    );
    expect(milton.stringify(3.14)).toBe(Chalk.bold.blue(`3.14`));
    expect(milton.stringify(true)).toBe(Chalk.bold.red(`true`));
    expect(milton.stringify(false)).toBe(Chalk.bold.red(`false`));
    expect(milton.stringify(null)).toBe(Chalk.bold.red(`null`));
  });

  test('jsValues', () => {
    expect(milton.stringify(undefined)).toBe(Chalk.inverse.red(`undefined`));
    expect(milton.stringify(NaN)).toBe(Chalk.bold.blue(`NaN`));
    expect(milton.stringify(Infinity)).toBe(Chalk.bold.blue(`Infinity`));
    expect(milton.stringify(-Infinity)).toBe(Chalk.bold.blue(`-Infinity`));
    expect(milton.stringify(-0)).toBe(Chalk.bold.blue(`-0`));
    expect(milton.stringify(123n)).toBe(Chalk.bold.blue(`123n`));
    expect(milton.stringify(-100000000000000005n)).toBe(
      Chalk.bold.blue(`-100000000000000005n`)
    );
    expect(milton.stringify(BigInt('-100000000000000006'))).toBe(
      Chalk.bold.blue(`-100000000000000006n`)
    );
  });

  test('js objects', () => {
    expect(milton.stringify(new Date('1995-12-17T03:24:00'))).toBe(
      Chalk.green(new Date('1995-12-17T10:24:00.000Z').toString())
    );
    expect(milton.stringify(/\.*/g)).toBe(Chalk.magenta(`/\\.*/g`));
    expect(milton.stringify(Symbol('Milton'))).toBe(
      Chalk.bold.magenta(`Symbol(Milton)`)
    );
    expect(
      milton.stringify(function yes() {
        return true;
      })
    ).toBe(Chalk.cyan(`[ƒ yes]`));
    expect(milton.stringify(new Error('bad'))).toBe(Chalk.red(`Error: bad`));
    // expect(milton.stringify(new Set([1, 2, 3]))).toBe(Chalk.bold.white(`Set(3) [ 1, 2, 3 ]`));  // Set(3) { 1, 2, 3 }
    // expect(milton.stringify(new Map([['key1', 'value1'], ['key2', 'value2']]))).toBe(Chalk.bold.white(`Map(2) [ [ "key1", "value1" ], [ "key2", "value2" ] ]`));  // Map(2) {"key1" => "value1", "key2" => "value2"}
  });

  test('Promises', () => {
    expect(milton.stringify(Promise.resolve('Hello'))).toBe(
      Chalk.italic.white(`Promise { ? }`)
    );
  });

  test('snapshot', () => {
    expect(milton.stringify(obj)).toMatchSnapshot();
  });
});
