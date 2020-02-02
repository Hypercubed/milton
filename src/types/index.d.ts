import { Milton } from '../lib/milton';

type Class<T = unknown> = new (...args: any[]) => T;

type Path = (string | number)[];
type StringifyFunction = (v: unknown, path: Path) => any;
type Replacer = (s: unknown, p: Path, value: unknown) => unknown | string;
type Plugin = (options: any, root: any, get: StringifyFunction) => Replacer;
type PluginWithOptions = (root: any, get: StringifyFunction) => Replacer;

type Preset = (_: Milton, ...args: any) => Milton;
