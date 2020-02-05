# TODO:
- [ ] colorize keys?
- [ ] test `blockXSS`
- [ ] `Buffer`? (`<Buffer 48 65 6c 6c 6f>`)
- [ ] inspect symbol (`Milton.inspect`)?
- [ ] boxed objects? (`new Number(XXX)`, `[Number: XXX]`)
- [ ] TypedArray?
- [ ] toJSON?
- [ ] `@@toStringTag`?  `Symbol.for('nodejs.util.inspect.custom')`?
- [ ] sort object keys plugin?
- [ ] error: `Error: bad at <anonymous>:28:12` ?
- [ ] toHumanReadableAnsi?  html plugin?  magicpen?
- [ ] plugin helpers (see https://github.com/twada/stringifier/blob/master/strategies.js)
- [ ] Plugin to align object keys?
- [?] `memoize` plugin?
- [ ] `lineSeparator` option?

## Optimization
  - [ ] https://github.com/twada/type-name passed to plugins
  - [ ] State object - https://github.com/substack/js-traverse

## maxDepth
  - [ ] Use class name when possible.

## js preset
  - [ ] long strings (`"sdfsdf" + \n + "sadfsdf"`)
  - [ ] Well known objects (i.e. `window` -> `(0,eval)('this')`)

## pretty preset
  - [ ] very long bigint?
  - [ ] Well known objects (i.e. `window` -> `[global]`)

## objectDecender
  - [ ] test comma option
  - [ ] test spacing option

## functions plugin
  - [ ] `ƒ B()`
  - [ ] `() => 1`
  - [ ] js version?
  - [ ] `[object GeneratorFunction]`, `[object Arguments]`?
  - [ ] Anonymous functions?

## trimStrings
  - [ ] tests for max option
  - [ ] trim at word boundry?
