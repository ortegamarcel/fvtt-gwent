import { MODULE } from "./constants.js";

export const genId = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};

export const getSetting = function (setting) {
    return game.settings.get(MODULE.ID, setting);
}

export const getValue = function (obj, propChain) {
    const props = propChain.split('.');
    return props.reduce((value, prop) => value[prop], obj);
}

export const createValueObj = function (base, propChain, value) {
    const props = propChain.split('.');
    // If a value is given, remove the last name and keep it for later:
    const lastProp = arguments.length === 3 ? props.pop() : false;

    // Walk the hierarchy, creating new objects where needed.
    // If the lastName was removed, then the last object is not set yet:
    for (var i = 0; i < props.length; i++) {
        base = base[props[i]] = base[props[i]] || {};
    }

    // If a value was given, set it to the last name:
    if (lastProp) {
        base = base[lastProp] = value;
    }

    // Return the last object in the hierarchy:
    return base;
};

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

export function isMyTurn(gwentData) {
    if (!gwentData.currentPlayer) return false;

    return gwentData.currentPlayer.isGM == game.user.isGM
        || gwentData.currentPlayer.actorId == game.user.character?.id;
}

export function amIPlayer1(gwentData) {
    if (!gwentData.player1) return false;

    return gwentData.player1.isGM == game.user.isGM
        || gwentData.player1.actorId == game.user.character?.id;
}

export function amIPlayer2(gwentData) {
    if (!gwentData.player2) return false;

    return gwentData.player2.isGM == game.user.isGM
        || gwentData.player2.actorId == game.user.character?.id;
}

export function amISpectator(gwentData) {
    if (!gwentData.currentPlayer || !gwentData.player1 || !gwentData.player2) {
        return false;
    }

    return gwentData.player1.isGM != game.user.isGM
        && gwentData.player1.actorId != game.user.character?.id
        && gwentData.player2.isGM != game.user.isGM
        && gwentData.player2.actorId != game.user.character?.id;
}