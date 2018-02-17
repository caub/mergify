## Mergify
[![npm version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![coverage status][codecov-image]][codecov-url]


```js
const merge = require('mergify');

class D { constructor(o) { Object.assign(this, o); } }

merge(
	{a: {x: 1}, b: [2, 4], c: ['x'], d: new D({x: 5}), e: new Set([1, 3])}, 
	{a: {y: 1}, b: {1: 3}, c: ['y'], d: new D({y: 5}), e: new Set([2, 3])}
) 

// { a: {x: 1, y: 1}, b: [ 2, 3 ], c: ['x', 'y'], d: new D({y: 5}), e: new Set([1, 3, 2]) }
```
- merges plain objects deeply
- handles Sets and Maps (native ones or immutablesjs, with duck-typing)
- concatenates arrays
- works well with configurations, like webpack ones

[npm-image]: https://img.shields.io/npm/v/mergify.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/mergify
[travis-image]: https://img.shields.io/travis/caub/mergify.svg?style=flat-square
[travis-url]: https://travis-ci.org/caub/mergify
[codecov-image]: https://img.shields.io/codecov/c/github/caub/mergify.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/caub/mergify
