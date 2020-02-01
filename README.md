# Milton

*Now Milton, don't be greedy; let's pass it along and make sure everyone gets a piece*

![](https://i.imgflip.com/3no9mr.jpg)

## Goals

Milton is JavaScript object stringifier powered by plugins.  Co-worker of [Smykowski](https://github.com/Hypercubed/smykowski).

## Features

- Extendable
- Types (`undefined`, `±Infinity`, `NaN`, `-0`)
- Objects (`RegExp`, `Date`, `Map` and `Set`)
- Classes and class instances
- ANSI colorized output

## Install

```bash
npm i @hypercubed/milton
```

## Usage

```js
import { Milton, pretty, ansiColors } from '@hypercubed/milton';

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
```

prints:

```
{
  null: null,
  numbers: [ 3.14159, NaN, Infinity, -Infinity, -0, -10000000000000006n ],
  strings: {
    empty: '',
    string: 'foo',
    multiline: '\n    This\n    is\n    multiline\n    '
  },
  arrays: { empty: [ ], array: [ 'one', 'two', 'three' ] },
  nested: { hello: 'hapi' },
  false: false,
  true: true,
  undef: undefined,
  error: Error: bad,
  regexp: /.*\n/g,
  symbol: Symbol(Waddams),
  function: [ƒ Yes],
  map: Map(2) { key1 => 'value1', key2 => 'value2' },
  set: Set(3) { 1, 2, 3 },
  date: Sun Dec 17 1995 03:24:00 GMT-0700 (Mountain Standard Time),
  objects: { class: [class: Milton], instance: Milton { } }
}
```

add the `ansiColors` plugin:

```js
milton.add(ansiColors);

const colorized = milton.stringify(obj);
console.log(colorized);
```

will print:

![](./output.png)

## Description

`Milton` is an interface for processing JS objects.  In `Milton` we have a concept of plugins and presets. Plugins are functions that define a "replacer" functions.  Replacer functions accept each value and returns a stringified result.  The value returned by the replacer function replaces the original value in the stringified result. If it returns `undefined` the property will be removed. If it returns the existing value it will be unchanged.  Values returned from one replacer are passed down to the next.  Plugins are added using the `.add` method on a `Milton` instance.  The order of the plugins does matter.  Plugins that stringify values should come first, followed by plugins that format the results.

Presets are ordered sets of plugins.  You may use a preset using the `.use` method on a milton instance. 

```ascii
| ........................ stringify ........................... |
        | .................... preset ................... |
        | ... plugin ... |

           +----------+     +----------+     +----------+
Input  --> | Replacer | --> | Replacer | --> | Replacer | --> Output
           +----------+     +----------+     +----------+

```

Presets and plugins may be used together:

```ts
milton.add(reference);
miltion.use(json);
milton.add(ansiColors);
```

## Presets

- `json` - Produces valid JSON; reproducing, as much as possible, the built-in `JSON.stringify`.
- `js` - Produces valid JS with support for additional types, printed as JS compatible code (for example `new Date("1995-12-17T10:24:00.000Z")`)
- `pretty` - Pretty prints objects and values, similar to the browser's console output or node's `util.inspect`.  Output is neither valid JSON nor valid JS.

(see [presets.ts](https://github.com/Hypercubed/milton/blob/master/src/lib/presets.ts) for implementation details)

## Plugins

- `reference` - Prints repeated objects as reference pointers
- `ansiColors` - Colorizes output based on types.

(see [plugins.ts](https://github.com/Hypercubed/milton/blob/master/src/lib/plugins.ts) for more)

## Writing Plugins and Presets

A plugin is a function that accepts an options object, the root value (the first value passed to the `Miltion#stringify` method), and a "get" function used for recursion.  The plugin should return a replacer function that is called (recursively) on each value in the object.

For example here is very simple plugin that will handle a hypothetical `Decimal` class:

```ts
const decimalPlugin = () => (s: any) => {
  if (s instanceof Decimal) {
    return s.toFloat();
  }
  return s;
};
```

It is importrant that the replacer function return the input value if it is unaltered.

(see [plugins.ts](https://github.com/Hypercubed/milton/blob/master/src/lib/plugins.ts) for more)

Presets are functions that add plugins to a `Milton` instance in a desiered order.  For example:

```ts
function myPrettyPrint(_: Milton) {
  _.add(reference);

  _.add(arrayDecender);
  _.add(objectDecender, { quoteKeys: false, compact: true });

  _.add(decimalPlugin);
  _.add(jsValues);
  _.add(jsonValues, { quote: `'` });

  _.add(maxDepth);
  _.add(indent);
  return _;
}
```

## API

### Class `Milton`

`new Milton()`

#### Method `milton.add(plugin[, options])`

```ts
add(plugin: Plugin, options?: any) => this
```

* `plugin` - A function that initializes returns a replacer
* `options` (optional, default = null) — Configuration for plugin

#### Method `milton.use(preset)`

```ts
use(preset: Preset, options: any) => this
```

* `preset` - A adds plugins to a milton instance in the desired order

#### Method `milton.stringify(value)`

```ts
stringify(value: any) => string
```

* `value` - any JS value supported by the plugins

Pass the value throuhgt the added replacers.

### `Replacer`

```ts
type Replacer = (s: any, p: Path, value: any) => unknown | string;
```

### `Plugin`

```ts
type Plugin = (options: any, root: any, get: StringifyFunction) => Replacer;
```

### `Preset`

```ts
type Preset = (milton: Milton) => Milton;
```


## License

This project is licensed under the MIT License - see the LICENSE file for details