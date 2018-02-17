const merge = require('..');

// test suite borrowed and modified from http://npm.im/deep-assign

it('assign own enumerable properties from source to target object', () => {
	expect(merge({foo: 0}, {bar: 1})).toEqual({foo: 0, bar: 1});
	expect(merge({foo: 0}, null, undefined)).toEqual(null);
	expect(merge({foo: 0}, undefined, {bar: 1}, undefined)).toEqual({foo: 0, bar: 1});
});

it('assign null values', () => {
	expect(merge({}, {foo: null})).toEqual({foo: null});
	expect(merge({bar: {foo: 77}}, {bar: {foo: null}})).toEqual({bar: {foo: null}});
});

it('replace null targets', () => {
	expect(merge({foo: null}, {foo: {}})).toEqual({foo: {}});
});

it('assign undefined values', () => {
	expect(merge({}, {foo: undefined})).toEqual({foo: undefined});
});

it('assign undefined targets', () => {
	expect(merge({foo: undefined}, {foo: {}})).toEqual({foo: {}});
});

it('not merge from complex objects', () => {
	const Unicorn = function (){};
	Unicorn.prototype.rainbows = undefined;
	const unicorn = new Unicorn();
	expect(merge(unicorn, {rainbows: 'many'})).toEqual({rainbows: 'many'});
});

it('not merge with complex object', () => {
	const Unicorn = function (){};
	Unicorn.prototype.rainbows = 'many';
	const unicorn = new Unicorn();
	unicorn.bar = 1;
	expect(merge({foo: 1}, unicorn)).toEqual(unicorn);
});

it('not merge with a target property in the prototype chain', () => {
	const amountOfRainbows = {amount: 'many'};
	const Unicorn = function (){};
	Unicorn.prototype.rainbows = amountOfRainbows;
	const unicorn = merge(new Unicorn(), {rainbows: 'none'});
	expect(unicorn).toEqual({rainbows: 'none'});
});

it('not support nested numbers unboxing', () => {
	const target = merge({answer: 42}, {answer: {rainbows: 'many'}});
	expect(target).toEqual({answer: {rainbows: 'many'}});
});

it('not support nested boolean unboxing', () => {
	const target = merge({foo: true}, {foo: {rainbows: 'many'}});
	expect(target.foo instanceof Boolean).toEqual(false);
	expect(target.foo.rainbows).toEqual('many');
});

it('not support nested strings unboxing', () => {
	const target = merge({rainbows: 'many'}, {rainbows: {answer: 42}});
	expect(target.rainbows instanceof String).toEqual(false);
	expect(target.rainbows.answer).toEqual(42);
});

it('support arrays as targets', () => {
	const target = {a: ['many']};
	const source = {a: []};
	source.a[2] = 'unicorns';
	const result = merge(target, source, {a: {answer: 42}});
	expect([...result.a]).toEqual(['many', , , 'unicorns']);
	expect(result.a.answer).toEqual(42);
});

it('not merge functions', () => {
	const oracle42 = () => 42;
	const oracle666 = () => 666;
	oracle42.foo = true;
	oracle42.bar = true;
	oracle666.bar = false;
	const target = merge({}, {oracle: oracle42}, {oracle: oracle666});
	expect(target.oracle()).toEqual(666);
	expect(target.oracle.foo).toEqual(undefined);
	expect(target.oracle.bar).toEqual(false);
});

it('support multiple sources', () => {
	expect(merge({foo: 0}, {bar: 1}, {bar: 2})).toEqual({foo: 0, bar: 2});
	expect(merge({}, {}, {foo: 1})).toEqual({foo: 1});
});

it('return the modified target object', () => {
	const target = {};
	const returned = merge(target, {a: 1});
	expect(returned).toEqual(target);
});

it('support `Object.create(null)` objects', () => {
	const obj = Object.create(null);
	obj.foo = true;
	expect(merge({}, obj)).toEqual({foo: true});
});

it('support `Object.create(null)` targets', () => {
	const target = Object.create(null);
	const expected = Object.create(null);
	target.foo = true;
	expected.foo = true;
	expected.bar = false;
	expect(merge(target, {bar: false})).toEqual(expected);
});

it('preserve property order', () => {
	const letters = 'abcdefghijklmnopqrst';
	const source = {};
	letters.split('').forEach(letter => {
		source[letter] = letter;
	});
	const target = merge({}, source);
	expect(Object.keys(target).join('')).toEqual(letters);
});

it('deep', () => {
	expect(merge({
		foo: {
			foo: {
				foo: true
			},
			bar: {
				bar: false
			}
		}
	}, {
		foo: {
			foo: {
				foo: false,
				bar: true
			}
		},
		bar: true
	})).toEqual({
		foo: {
			foo: {
				foo: false,
				bar: true
			},
			bar: {
				bar: false
			}
		},
		bar: true
	});
});

it('overwrite primitives as targets', () => {
	const target = merge({sym: Symbol.for('foo')}, {sym: {rainbows: 'many'}});
	expect(target.sym).toEqual({rainbows: 'many'});
});

it('support symbol properties', () => {
	const target = {};
	const source = {};
	const sym = Symbol('foo');
	source[sym] = 'bar';
	merge(target, source);
	expect(target[sym]).toEqual('bar');
});

it('only copy enumerable symbols', () => {
	const target = {};
	const source = {};
	const sym = Symbol('foo');
	Object.defineProperty(source, sym, {
		enumerable: false,
		value: 'bar'
	});
	merge(target, source);
	expect(sym in target).toEqual(false);
});

it('do not transform functions', () => {
	const target = {foo: function bar() {}};
	const source = {};
	expect(typeof merge({}, target, source).foo).toEqual('function');
});

it('reuse object in deep copy', () => {
	const fixture = {
		foo: {
			bar: false
		}
	};

	const run = x => {
		const opts = merge({}, fixture);

		if (x === true) {
			opts.foo.bar = true;
		}

		return opts.foo.bar;
	};

	expect(run(true)).toEqual(true);
	expect(run()).toEqual(true);
});

it('merge Sets', () => {
	const s1 = new Set([1, 3]);
	const s2 = new Set([6, 3]);
	expect(merge(s1, s2)).toEqual(new Set([1, 3, 6]));
});

it('merge Maps', () => {
	const s1 = new Map([[1, 3], [3, 4]]);
	const s2 = new Map([[6, 3], [3, 2]]);
	expect(merge(s1, s2)).toEqual(new Map([[1, 3], [3,2], [6, 3]]));
});

it('works with README example:)', () => {
	class D { constructor(o) { Object.assign(this, o); } }

	expect(
		merge(
			{a: {x: 1}, b: [2, 4], c: ['x'], d: new D({x: 5}), e: new Set([1, 3])}, 
			{a: {y: 1}, b: {1: 3}, c: ['y'], d: new D({y: 5}), e: new Set([2, 3])}
		)
	).toEqual(
		{ a: {x: 1, y: 1}, b: [ 2, 3 ], c: ['x', 'y'], d: new D({y: 5}), e: new Set([1, 3, 2]) }
	);
})

it('merge deep', () => {
	const x = merge(
		{d: {attrs:[]}}, 
		{a: 2},
		{a: 1, b: {c: [1,2]}, d: {attrs: ['oko', 'uhih']}}, 
		{b: {d:4, c:[5]}}
	);
	expect(x).toEqual(
		{
			d: { attrs: [ 'oko', 'uhih' ] },
			a: 1,
			b: { c: [1, 2, 5], d: 4 } 
		}
	);

	const x1 = merge(
		{d: {attrs:[]}}, 
		{a: 2}, 
		{a: 1, b: {c: [1,2]}, d: {attrs: ['oko', 'uhih']}}, 
		{b: {d:4, c: {0:5}}}
	);

	expect(x1).toEqual(
		{
			d: { attrs: [ 'oko', 'uhih' ] },
			a: 1,
			b: { c: [5,2], d: 4 } 
		}
	);

	const x2 = merge(
		{}, 
		{x: 'ok', z: {w: 7}}, 
		{x: 'pp', y: [2,3]}, 
		{z: {v: 2}, y: [4]}
	);

	expect(x2).toEqual(
		{
			x: 'pp', 
			z: { w: 7, v: 2 }, 
			y: [2, 3, 4] 
		}
	);

	const x3 = merge({}, {x: 'ok', z: {w:7}}, {x: 'pp', y: 4}, {z: null});

	expect(x3).toEqual(
		{
			x: 'pp', 
			z: null, 
			y: 4 
		}
	);
});


console.time('how fast is it?');
for (var i=0; i<1e4; i++) {
	merge({}, {d:{attrs:[]}}, {a:2}, {a:1, b:{c:[1,2]}, d:{attrs:['oko', 'uhih']}}, {b:{d:4, c:[5]}})
}
console.timeEnd('how fast is it?');
