const assert = require('assert');
const suite = require('chuhai');
const stringifier = require('stringifier');
const stringifyObject = require('stringify-object');
const devalue = require('devalue');

const { Milton, json } = require('../build/main/index');

const milton = new Milton();
milton.use(json);

suite('array concat', s => {
  const obj = {
    arr: [1, 2, 3],
    str: 'Hello World',
    obj: {
      x: 1,
      y: 2 
    }
  };

  let str = '';
  let ans = '';

  const jsonOutput = '{"arr":[1,2,3],"str":"Hello World","obj":{"x":1,"y":2}}';
  const stringifierOutput = 'Object{arr:[1,2,3],str:"Hello World",obj:Object{x:1,y:2}}';
  const stringifyObjectOutput =  '{arr: [1, 2, 3], str: "Hello World", obj: {x: 1, y: 2}}';
  const devalueOutput = '(function(a,b){return {arr:[a,b,3],str:"Hello World",obj:{x:a,y:b}}}(1,2))';

  s.cycle(() => {
    assert.equal(str, ans);
    str = '';
    ans = '';
  });

  s.burn('JSON', () => {
    str = JSON.stringify(obj);
    ans = jsonOutput;
  });

  s.bench('JSON', () => {
    str = JSON.stringify(obj);
    ans = jsonOutput;
  });

  s.bench('Milton', () => {
    str = milton.stringify(obj);
    ans = jsonOutput;
  });

  s.bench('stringifier', () => {
    str = stringifier.stringify(obj);
    ans = stringifierOutput;
  });

  const stringifyObjectOptions = {
    indent: '',
    singleQuotes: false,
    inlineCharacterLimit: 80
  };

  s.bench('stringify-object', () => {
    str = stringifyObject(obj, stringifyObjectOptions);
    ans = stringifyObjectOutput;
  });

  s.bench('devalue', () => {
    str = devalue(obj);
    ans = devalueOutput;
  });
});
