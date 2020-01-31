import { Class, Path, StringifyFunction } from './milton.d';
import Chalk from 'chalk';

const { toString } = Object.prototype;

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

const JSON_OPTIONS = {
  quote: '"'
};

export const jsonValues = (options: typeof JSON_OPTIONS) => {
  options = { ...JSON_OPTIONS, ...options };
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

export const jsonCatch = (options: typeof JSON_OPTIONS) => {
  options = { ...JSON_OPTIONS, ...options };
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
  options: typeof ARRAY_DECENDER_OPTIONS,
  _root: any,
  get: StringifyFunction
) => {
  options = { ...ARRAY_DECENDER_OPTIONS, ...options };

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
        if (s.hasOwnProperty(key)) {
          const v = get(s[key], path.concat([key]));
          if (v) acc.push(v);
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

const OBJECT_DECENDER_OPTIONS = {
  comma: true,
  brackets: '{}',
  quoteKeys: true,
  compact: true,
  quote: '"'
};

export const objectDecender = (
  options: typeof OBJECT_DECENDER_OPTIONS,
  _root: any,
  get: StringifyFunction
) => {
  options = { ...OBJECT_DECENDER_OPTIONS, ...options };

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
        if (s.hasOwnProperty(key)) {
          const v = get(s[key], path.concat([key]));
          key = String(key);
          const esc = escape(String(key));
          key = esc !== key || options.quoteKeys ? `"${esc}"` : key;
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
  indent: '  ' as string | number
};

export const indent = (options: typeof INDENT_OPTIONS) => (s: any) => {
  options = { ...INDENT_OPTIONS, ...options };
  if (typeof options.indent === 'number')
    options.indent = ' '.repeat(options.indent);
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

export const breakLength = (options: typeof BREAK_OPTIONS) => (s: any) => {
  options = { ...BREAK_OPTIONS, ...options };

  if (typeof s === 'string') {
    const oneline = s.replace(/\n\s*/g, options.compact ? '' : ' ');

    return oneline.length < options.breakLength ? oneline : s;
  }
  return s;
};

export const jsValues = () => (s: any) => {
  if (s === void 0) return String(s);
  if (typeof s === 'number' && !isFinite(s)) {
    // +/- Infinity or NaN
    return String(s);
  }
  if (s === 0 && 1 / s < 0) return '-0';
  return s;
};

const SYMBOLS_OPTIONS = {
  quote: true
};

export const symbols = (options: typeof SYMBOLS_OPTIONS) => (s: any) => {
  options = { ...SYMBOLS_OPTIONS, ...options };
  if (typeof s === 'symbol') {
    const esc = escape((s as any).description);
    return options.quote ? `Symbol("${esc}")` : `Symbol(${esc})`;
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
  quoteKeys: false
};

// Compact option, quote keys?
export const prettySetMap = (
  options: typeof SET_MAP_OPTIONS,
  _root: any,
  g: any
) => {
  options = { ...SET_MAP_OPTIONS, ...options };
  return (s: any, p: Path) => {
    if (s instanceof Map) {
      const arr = Array.from(s)
        .map(([key, v], i) => {
          key = String(key);
          const esc = escape(String(key));
          key = esc !== key || options.quoteKeys ? `"${esc}"` : key;
          return `${key} => ` + g(v, p.concat([i]));
        })
        .join(', ');
      return `Map(${s.size}) { ${arr} }`;
    }
    if (s instanceof Set) {
      const arr = Array.from(s)
        .map((x, i) => g(x, p.concat([i])))
        .join(', ');
      return `Set(${s.size}) { ${arr} }`;
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

const PRIVATE_OPTIONS = {
  prefix: '_'
};

export const skipPrivate = (options: typeof PRIVATE_OPTIONS) => {
  options = { ...PRIVATE_OPTIONS, ...options };
  return (s: any, p: Path) => {
    const key = p[p.length - 1];
    if (typeof key === 'string' && key.startsWith(options.prefix)) {
      return '';
    }
    return s;
  };
};

export const circular = () => {
  const repeated = new WeakMap();
  return (s: any, path: Path) => {
    const t = toString.call(s);
    if (
      t === '[object Array]' ||
      t === '[object Object]' ||
      t === '[object Map]' ||
      t === '[object Set]'
    ) {
      if (repeated.has(s)) {
        const p = repeated.get(s);
        return `[Circular ${p}]`;
      }
      repeated.set(s, path.join('.'));
    }
    return s;
  };
};

export const COLORIZE_OPTIONS = {
  undefined: 'red.inverse',
  boolean: 'red.bold',
  number: 'blue.bold',
  string: 'yellow',
  symbol: 'magenta.bold',
  function: 'cyan',
  null: 'red.bold',

  Error: 'red',
  RegExp: 'magenta',
  Date: 'green',
  Object: 'white.bold'
};

export const colorize = (colors: typeof COLORIZE_OPTIONS) => (
  s: any,
  _p: Path,
  v: any
) => {
  colors = { ...COLORIZE_OPTIONS, ...colors };
  let t: string = typeof v;
  if (v === null) {
    t = 'null';
  } else if (t === 'object') {
    t = v.constructor.name;
  }

  const _colors = (colors as any)[t];
  if (!_colors) return s;

  const colorArr = _colors.split('.');
  for (let i = 0; i < colorArr.length; ++i) {
    const color = colorArr[i];
    // tslint:disable-next-line: tsr-detect-unsafe-properties-access
    s = (Chalk as any)[color](s);
  }
  return s;
};

const DEPTH_OPTIONS = {
  max: 3
};

export const maxDepth = (options: typeof DEPTH_OPTIONS) => {
  options = { ...DEPTH_OPTIONS, ...options };
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
  show: 100
};

// Typed arrays, sets
export const maxArrayLength = (options: typeof MAX_ARRAY_OPTIONS) => {
  options = { ...MAX_ARRAY_OPTIONS, ...options };
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
