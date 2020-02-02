# TODO:

- [ ] colorize keys?
- [ ] test `toString` in classes plugin
- [ ] test `blockXSS`
- [ ] sparse array? (`[ 1, <1 empty item>, 3, <1 empty item>, 5 ]`)
- [ ] `Buffer`? (`<Buffer 48 65 6c 6c 6f>`)
- [ ] inspect symbol (`Milton.inspect`)?
- [ ] boxed objects? (`new Number(XXX)`, `[Number: XXX]`)
- [ ] TypedArray?
- [ ] toJSON?
- [ ] `@@toStringTag`?  `Symbol.for('nodejs.util.inspect.custom')`?
- [ ] sort object keys plugin?
- [ ] error: `Error: bad at <anonymous>:28:12` ?
- [ ] toHumanReadableAnsi?
- [ ] plugin helpers (see https://github.com/twada/stringifier/blob/master/strategies.js)
- [ ] check other keys (i.e. `foo-bar` -> `"foo-bar"`) `/^[a-z$_][a-z$_0-9]*$/i`
- [ ] Plugin to align object keys?
- [ ] `memoize` plugin?
- [ ] `lineSeparator` option?

- js preset
  - [ ] long strings (`"sdfsdf" + \n + "sadfsdf"`)
  - [ ] Well known objects (i.e. `global` -> `(0,eval)('this')`)

- pretty preset
  - [ ] very long bigint?
  - [ ] Well known objects (i.e. `global` -> `[global]`)

- objectDecender
  - [ ] test comma option
  - [ ] test spacing option

- functions plugin
  - `ƒ B()`
  - `() => 1`
  - js version?
  - [ ] `[object GeneratorFunction]`, `[object Arguments]`?
