import jsonpointer from 'json-pointer';
import stripAnsi from 'strip-ansi';
import Chalk from 'chalk';

export type Class<T = unknown> = new (...args: any[]) => T;
export type Path = (string | number)[];
export type StringifyFunction = (v: unknown, path: Path) => any;
export type Replacer = (
  s: unknown,
  p: Path,
  value: unknown
) => unknown | string;
export type Plugin = (
  options: any,
  root: any,
  get: StringifyFunction
) => Replacer;

const { toString, hasOwnProperty } = Object.prototype;

function isClass(x: any): x is Class {
  return typeof x === 'function' && x.toString().startsWith('class ');
}

function escape(s: string) {
  return ('' + s).replace(/["'\\\n\r\t\u2028\u2029]/g, (character: string) => {
    // Escape all characters not included in SingleStringCharacters and
    // DoubleStringCharacters on
    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
    switch (character) {
      case '"':
      case '\'':
      case '\\':
        return '\\' + character;
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '\t':
        return '\\t';
      case '\u2028':
        return '\\u2028';
      case '\u2029':
        return '\\u2029';
    }
    return character;
  });
}

function quotes(s: boolean | string) {
  if (s === true) return `'`;
  if (s === false) return '';
  if (s === 'single') return `'`;
  if (s === 'double') return `"`;
  return s;
}

function indentOption(s: boolean | string | number) {
  if (s === true) return `  `;
  if (s === false) return '';
  if (typeof s === 'number') return ` `.repeat(s);
  return s;
}

// PLUGINS

const JSON_OPTIONS = {
  quote: '"' as string | boolean
};

/**
 * Process accepted JSON values
 */
export const jsonValues = (_options: Partial<typeof JSON_OPTIONS>) => {
  // tslint:disable-next-line: no-object-literal-type-assertion
  const options: typeof JSON_OPTIONS = { ...JSON_OPTIONS, ..._options };
  options.quote = quotes(options.quote);
  return (s: any, _p: Path, value: any) => {
    const t = typeof s;
    if (s === null || t === 'number' || t === 'boolean') {
      return String(s);
    } else if (t === 'string' && value === s) {
      return options.quote + escape(s) + options.quote;
    }
    return s;
  };
};

/**
 * Process unaccepted JSON values
 */
export const jsonCatch = (_options: Partial<typeof JSON_OPTIONS>) => {
  const options = { ...JSON_OPTIONS, ..._options };
  options.quote = quotes(options.quote);
  return (s: any) => {
    const t = typeof s;
    if (s instanceof Date) {
      return options.quote + s.toISOString() + options.quote;
    } else if (t === 'object') {
      return `{}`;
    } else if (t === 'symbol' || t === 'function') {
      return undefined;
    }
    return s;
  };
};

const ARRAY_DECENDER_OPTIONS = {
  comma: true,
  brackets: '[]'
};

export const arrayDecender = (
  _options: Partial<typeof ARRAY_DECENDER_OPTIONS>,
  _root: any,
  get: StringifyFunction
) => {
  const options = { ...ARRAY_DECENDER_OPTIONS, ..._options };

  const seen: any[] = [];
  return (s: any, path: Path) => {
    const type = toString.call(s);
    if (type === '[object Array]') {
      if (seen.includes(s)) {
        throw new TypeError('Converting circular structure to JSON');
      }
      seen.push(s);

      const acc = [];
      for (const key in s) {
        if (hasOwnProperty.call(s, key)) {
          const v = get(s[key], path.concat([key]));
          if (v) acc.push(v);
        }
      }
      seen.pop();
      return (
        options.brackets[0] +
        '\n' +
        acc.join(options.comma ? ',\n' : '\n') +
        '\n' +
        options.brackets[1]
      );
    }
    return s;
  };
};

const OBJECT_DECENDER_OPTIONS = {
  comma: true,
  brackets: '{}',
  quoteKeys: true,
  compact: true,
  quote: '"'
};

export const objectDecender = (
  _options: Partial<typeof OBJECT_DECENDER_OPTIONS>,
  _root: any,
  get: StringifyFunction
) => {
  const options = { ...OBJECT_DECENDER_OPTIONS, ..._options };
  options.quote = quotes(options.quote);

  const seen: any[] = [];
  return (s: any, path: Path) => {
    const type = toString.call(s);
    if (type === '[object Object]') {
      if (seen.includes(s)) {
        throw new TypeError('Converting circular structure to JSON');
      }
      seen.push(s);

      const acc = [];
      for (let key in s) {
        if (hasOwnProperty.call(s, key)) {
          const v = get(s[key], path.concat([key]));
          key = String(key);
          const esc = escape(String(key));
          key =
            esc !== key || options.quoteKeys
              ? `${options.quote}${esc}${options.quote}`
              : key;
          if (v) acc.push(key + (options.compact ? ':' : ': ') + v);
        }
      }
      seen.pop();
      return (
        options.brackets[0] +
        '\n' +
        acc.join(options.comma ? ',\n' : ' \n') +
        '\n' +
        options.brackets[1]
      );
    }
    return s;
  };
};

const INDENT_OPTIONS = {
  indent: '  ' as string | number | boolean
};

export const indent = (_options: Partial<typeof INDENT_OPTIONS>) => (
  s: any
) => {
  const options = { ...INDENT_OPTIONS, ..._options };
  options.indent = indentOption(options.indent);
  if (typeof s === 'string') {
    return s
      .split('\n')
      .map((ss, i, arr) =>
        i > 0 && i < arr.length - 1 ? options.indent + ss : ss
      )
      .join('\n');
  }
  return s;
};

const BREAK_OPTIONS = {
  compact: true,
  breakLength: 80
};

export const breakLength = (_options: Partial<typeof BREAK_OPTIONS>) => {
  const options = { ...BREAK_OPTIONS, ..._options };
  return (s: any) => {
    if (typeof s === 'string') {
      const oneline = s.replace(/\n\s*/g, options.compact ? '' : ' ');
      return stripAnsi(oneline).length < options.breakLength ? oneline : s;
    }
    return s;
  };
};

/**
 * Process other JS values
 */
export const jsValues = () => (s: any) => {
  if (s === void 0) return String(s);
  switch (typeof s) {
    case 'number':
      if (!isFinite(s)) return String(s);
      if (s === 0 && 1 / s < 0) return '-0';
      break;
    case 'bigint':
      return String(s) + 'n';
  }
  return s;
};

const SYMBOLS_OPTIONS = {
  quote: `"` as string | boolean
};

export const symbols = (_options: Partial<typeof SYMBOLS_OPTIONS>) => (
  s: any
) => {
  const options = { ...SYMBOLS_OPTIONS, ..._options };
  options.quote = quotes(options.quote);
  if (typeof s === 'symbol') {
    const esc = escape((s as any).description);
    return `Symbol(${options.quote}${esc}${options.quote})`;
  }
  return s;
};

// TODO: args?
export const functions = () => (s: any) => {
  if (typeof s === 'function') {
    const name = s.name ? ` ${s.name}` : '';
    return `[ƒ${name}]`;
  }
  return s;
};

export const dates = (_options: any, _root: any, g: any) => (s: any) => {
  if (s instanceof Date) {
    return `new Date(${g(s.toISOString(), [])})`;
  }
  return s;
};

export const prettyDates = (_options: any, _root: any) => (s: any) => {
  if (s instanceof Date) {
    return String(s);
  }
  return s;
};

export const errors = (_options: any, _root: any, g: any) => (s: any) => {
  if (s instanceof Error) {
    return `new Error(${g(String(s.message), [])})`;
  }
  return s;
};

export const prettyErrors = (_options: any, _root: any) => (s: any) => {
  if (s instanceof Error) {
    return `Error: ${String(s.message)}`;
  }
  return s;
};

export const regexp = (_options: any, _root: any, g: any) => (s: any) => {
  if (toString.call(s) === '[object RegExp]') {
    return `new RegExp(${g(s.source, [])}, ${g(s.flags, [])})`;
  }
  return s;
};

export const prettyRegex = (_options: any, _root: any) => (s: any) => {
  if (toString.call(s) === '[object RegExp]') {
    return String(s);
  }
  return s;
};

export const setMap = (_options: any, _root: any, g: any) => (
  s: any,
  p: Path
) => {
  if (s instanceof Map) {
    const arr = Array.from(s).map((x, i) => g(x, p.concat([i])));
    return `new Map(\n[${arr}]\n)`;
  }
  if (s instanceof Set) {
    const arr = Array.from(s).map((x, i) => g(x, p.concat([i])));
    return `new Set(\n[${arr}]\n)`;
  }
  return s;
};

const SET_MAP_OPTIONS = {
  quote: false as boolean | string
};

// Compact option, quote keys?
export const prettySetMap = (
  _options: Partial<typeof SET_MAP_OPTIONS>,
  _root: any,
  g: any
) => {
  const options = { ...SET_MAP_OPTIONS, ..._options };
  options.quote = quotes(options.quote);
  return (s: any, p: Path) => {
    if (s instanceof Map) {
      const arr = Array.from(s)
        .map(([key, v], i) => {
          key = String(key);
          const esc = escape(String(key));
          key =
            esc !== key || options.quote
              ? `${options.quote}${esc}${options.quote}`
              : key;
          return `${key} => ` + g(v, p.concat([i]));
        })
        .join(', ');
      return `Map(${s.size}) { ${arr} }`;
    } else if (s instanceof Set) {
      const arr = Array.from(s)
        .map((x, i) => g(x, p.concat([i])))
        .join(', ');
      return `Set(${s.size}) { ${arr} }`;
    } else if (s instanceof WeakMap) {
      return `WeakMap {}`;
    } else if (s instanceof WeakSet) {
      return `WeakSet {}`;
    }
    return s;
  };
};

// Get rid of v
export const classes = () => (s: any, _p: Path, v: any) => {
  const t = toString.call(v);
  if (t === '[object Object]') {
    const c = v.constructor.name;
    if (c !== 'Object') {
      return c + ' ' + s;
    }
  } else if (isClass(v)) {
    const name = v.name ? ': ' + v.name : '';
    return `[class${name}]`;
  }
  return s;
};

export const promises = () => (s: any, _p: Path, v: any) => {
  if (toString.call(v) === '[object Promise]') {
    return 'Promise { ? }';
  }
  return s;
};

const PRIVATE_OPTIONS = {
  prefix: '_'
};

export const skipPrivate = (options: Partial<typeof PRIVATE_OPTIONS>) => {
  const _options = { ...PRIVATE_OPTIONS, ...options };
  return (s: any, p: Path) => {
    const key = p[p.length - 1];
    if (typeof key === 'string' && key.startsWith(_options.prefix)) {
      return '';
    }
    return s;
  };
};

export const reference = () => {
  const repeated = new WeakMap();
  return (s: any, path: Path) => {
    if (s !== null && typeof s === 'object') {
      if (repeated.has(s)) {
        const p = jsonpointer.compile(repeated.get(s));
        return `[Reference #${p}]`;
      }
      repeated.set(s, path);
    }
    return s;
  };
};

export const COLORIZE_OPTIONS = {
  undefined: 'red.inverse',
  boolean: 'red.bold',
  number: 'blue.bold',
  bigint: 'blue.bold',
  string: 'yellow',
  symbol: 'magenta.bold',
  function: 'cyan',
  null: 'red.bold',

  Error: 'red',
  RegExp: 'magenta',
  Date: 'green',
  Object: 'white.bold',
  Promise: 'white.italic'
};

export const ansiColors = (colors: { [key: string]: string }) => (
  s: any,
  _p: Path,
  v: any
) => {
  colors = { ...COLORIZE_OPTIONS, ...colors };
  let t: string = typeof v;
  if (v === null) {
    t = 'null';
  } else if (t === 'object' && v.constructor) {
    t = v.constructor.name;
  }

  const _colors = (colors as any)[t];
  if (!_colors) return s;

  const colorArr = _colors.split('.');
  for (let i = 0; i < colorArr.length; ++i) {
    const color = colorArr[i];
    // tslint:disable-next-line: tsr-detect-unsafe-properties-access
    const f = (Chalk as any)[color];
    if (typeof f !== 'function') {
      throw new Error(`Unknown Chalk style: ${_colors}`);
    }
    s = f(s);
  }
  return s;
};

const DEPTH_OPTIONS = {
  max: 3
};

export const maxDepth = (_options: Partial<typeof DEPTH_OPTIONS>) => {
  const options = { ...DEPTH_OPTIONS, ..._options };
  return (s: any, p: Path, v: any) => {
    const t = toString.call(v);
    if (p.length > options.max) {
      if (t === '[object Object]') {
        return '{...}';
      }
      if (t === '[object Array]') {
        return `Array(${v.length})`;
      }
    }
    return s;
  };
};

const MAX_ARRAY_OPTIONS = {
  max: 100,
  show: null as any
};

// Typed arrays, sets
export const maxArrayLength = (_options: Partial<typeof MAX_ARRAY_OPTIONS>) => {
  const options = { ...MAX_ARRAY_OPTIONS, ..._options };
  options.show = options.show || options.max;
  return (s: any, _p: Path, v: any) => {
    const t = toString.call(v);
    if (t === '[object Array]') {
      const sp = s.split('\n');
      if (sp.length > options.max) {
        const f = sp.splice(0, options.show).join('\n');
        const e = sp.pop();
        const l = sp.pop();
        const ll = l ? l.split(/\S/)[0] : '';
        s = `${f}\n${ll}...\n${e}`;
      }
    }
    return s;
  };
};

// TODO: https://github.com/Rich-Harris/devalue/blob/master/src/index.ts#L4
export const blockXSS = () => {
  return (s: any) => {
    if (typeof s === 'string') {
      return s
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')
        .replace(/</g, '\\u003C')
        .replace(/>/g, '\\u003E')
        .replace(/\//g, '\\u002F');
    }
    return s;
  };
};

const TRIM_STRING_OPTIONS = {
  max: 80,
  show: [70, 10],
  snip: ' ... '
};

export const trimStrings = (_options: Partial<typeof TRIM_STRING_OPTIONS>) => {
  const options = { ...TRIM_STRING_OPTIONS, ..._options };
  options.show = options.show || options.max;
  return (s: any, _p: Path, v: any) => {
    if (
      typeof v === 'string' &&
      typeof s === 'string' &&
      s.length > options.max
    ) {
      return (
        s.slice(0, options.show[0]) + options.snip + s.slice(-options.show[1])
      );
    }
    return s;
  };
};

export const objectToString = () => (s: any, _p: Path, v: any) => {
  const t = toString.call(v);
  if (t === '[object Object]' && v.toString) {
    const vt = v.toString();
    if (vt !== t) return vt;
  }
  return s;
};

