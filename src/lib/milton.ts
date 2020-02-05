import { Path, Plugin, Replacer, StringifyFunction } from './plugins';
import { Preset } from './presets';

type PluginWithOptions = (root: any, get: StringifyFunction) => Replacer;

export class Milton {
  private _replacers: PluginWithOptions[] = [];

  stringify(value: any): any {
    if (this._replacers.length < 1) {
      throw new Error('PC LOAD LETTER');
    }

    const _stringify = (v: any, path: Path): string => {
      return replacers.reduce((acc, fn) => fn(acc, path, v), v);
    };

    const replacers = this._replacers.map(p => p(value, _stringify));

    return _stringify(value, []);
  }

  add<T extends Plugin>(plugin: T, options?: Parameters<T>[0]) {
    this._replacers.push(plugin.bind(this, options || null));
    return this;
  }

  use<T extends Preset>(preset: T, options?: Parameters<T>[1]) {
    preset(this, options);
    return this;
  }
}
