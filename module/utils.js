import { MODULE } from "./constants.js";

export const genId = function() {
	// Math.random should be unique because of its seeding algorithm.
	// Convert it to base 36 (numbers + letters), and grab the first 9 characters
	// after the decimal.
	return '_' + Math.random().toString(36).substr(2, 9);
};

export const getSetting = function(setting) {
    return game.settings.get(MODULE.ID, setting);
}

export const getValue = function(obj, propChain) {
    const props = propChain.split('.');
    return props.reduce((value, prop) => value[prop], obj);
}

export const createValueObj = function(base, propChain, value) {
    const props = propChain.split('.');
    // If a value is given, remove the last name and keep it for later:
    const lastProp = arguments.length === 3 ? props.pop() : false;

    // Walk the hierarchy, creating new objects where needed.
    // If the lastName was removed, then the last object is not set yet:
    for( var i = 0; i < props.length; i++ ) {
        base = base[ props[i] ] = base[ props[i] ] || {};
    }

    // If a value was given, set it to the last name:
    if (lastProp) {
        base = base[lastProp] = value;
    }

    // Return the last object in the hierarchy:
    return base;
};