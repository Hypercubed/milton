import { Milton } from './milton';
import {
  jsonCatch,
  colorize,
  prettySetMap,
  prettyErrors,
  prettyRegex,
  prettyDates,
  maxArrayLength,
  maxDepth,
  circular,
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
  setMap
} from './plugins';

export function json(_: Milton) {
  _.add(arrayDecender);
  _.add(objectDecender);
  _.add(jsonValues);
  _.add(jsonCatch);

  _.add(indent);
  _.add(breakLength);
  return _;
}

export function js(_: Milton) {
  _.add(arrayDecender);
  _.add(objectDecender);
  _.add(jsValues);
  _.add(jsonValues);

  _.add(symbols);
  _.add(dates);
  _.add(errors);
  _.add(regexp);
  _.add(setMap);
  _.add(jsonCatch);

  _.add(indent);
  _.add(breakLength);

  return _;
}

export function pretty(_: Milton) {
  _.add(circular);

  _.add(arrayDecender);
  _.add(objectDecender, { quoteKeys: false, compact: false });

  _.add(functions);
  _.add(classes);
  _.add(skipPrivate);
  _.add(jsValues);
  _.add(jsonValues);

  _.add(symbols, { quote: false });
  _.add(prettyDates);
  _.add(prettyErrors);
  _.add(prettyRegex);
  _.add(prettySetMap);

  _.add(maxArrayLength, { max: 80, show: 20 });
  _.add(maxDepth);
  _.add(indent);
  _.add(breakLength, { compact: false });

  return _;
}

export function prettyColors(_: Milton) {
  _.use(pretty);
  _.add(colorize);

  return _;
}
