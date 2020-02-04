import { Milton } from './milton';

export type Preset = (_: Milton, ...args: any) => Milton;

import {
  jsonCatch,
  prettySetMap,
  prettyErrors,
  prettyRegex,
  prettyDates,
  maxDepth,
  reference,
  skipPrivate,
  classes,
  jsonValues,
  arrayDecender,
  objectDecender,
  breakLength,
  indent,
  jsValues,
  symbols,
  functions,
  dates,
  errors,
  regexp,
  setMap,
  trimStrings,
  promises,
  objectToString
} from './plugins';

export function json(_: Milton) {
  _.add(jsonValues);

  _.add(arrayDecender);
  _.add(objectDecender);
  
  _.add(jsonCatch);

  _.add(indent);
  _.add(breakLength);
  return _;
}

export function js(_: Milton) {
  _.add(jsValues);
  _.add(jsonValues, { quote: `'` });

  _.add(symbols, { quote: `'` });
  _.add(dates);
  _.add(errors);
  _.add(regexp);
  _.add(setMap);

  _.add(arrayDecender, { sparse: true });
  _.add(objectDecender, { quote: `'`, quoteKeys: false, compact: false });

  _.add(jsonCatch);

  _.add(indent);
  _.add(breakLength, { compact: false });

  return _;
}

export function pretty(_: Milton) {
  _.add(reference);

  _.add(functions);
  _.add(skipPrivate);
  _.add(jsValues);
  _.add(jsonValues, { quote: `'` });

  _.add(symbols, { quote: false });
  _.add(prettyDates);
  _.add(prettyErrors);
  _.add(prettyRegex);
  _.add(prettySetMap);
  _.add(promises);

  _.add(arrayDecender, { maxLength: 20, sparse: true });
  _.add(objectDecender, { quote: `'`, quoteKeys: false, compact: false });

  _.add(classes);
  _.add(objectToString);

  _.add(trimStrings);
  _.add(maxDepth);
  _.add(indent);
  _.add(breakLength, { compact: false });

  return _;
}
