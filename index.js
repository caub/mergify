function isPojo(o) {
	var proto = Object.getPrototypeOf(o);
	return proto === null || Object.getPrototypeOf(proto) === null;
}

function merge() {
	var target = arguments[0];
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i];
		if (source === undefined) { // do nothing
		} else if (source === null || target == null) {
			target = source;
		} else {
			if ((isPojo(target) || Array.isArray(target)) && isPojo(source)) { // merge resourcesively source into target
				Object.keys(source).forEach(function (key) {
					target[key] = merge(target[key], source[key]);
				});
				Object.getOwnPropertySymbols(source).forEach(function (key) {
					if (Object.getOwnPropertyDescriptor(source, key).enumerable) {
						target[key] = merge(target[key], source[key]);
					}
				});
			} else if (Array.isArray(target) && Array.isArray(source)) { // concat
				target = target.concat(source);
			} else if (typeof target.add === 'function' && typeof source.add === 'function') { // Set-like
				source.forEach(function (value) {
					target.add(value);
				});
			} else if (typeof target.set === 'function' && typeof source.set === 'function') { // Map-like
				source.forEach(function (value, key) {
					target.set(key, merge(target.get(key), value));
				});
			} else { // if target is a number, boolean, string, symbol, function or complex object instance, then just replace
				target = source;
			}
		}
	}
	return target;
}

module.exports = merge;