import { MODULE } from "./constants.js";
import { getSetting } from "./utils.js";

export const logger = {
    log: (msg, ...args) => {
        if (getSetting('debug')) {
            console.log(`${MODULE.ID} | ${msg}`, ...args);
        }
    },
    warn: (msg, ...args) => {
        console.warn(`${MODULE.ID} | ${msg}`, ...args);
    },
    error: (msg, ...args) => {
        console.error(`${MODULE.ID} | ${msg}`, ...args);
    },
    info: (msg, ...args) => {
        if (getSetting('debug')) {
            console.info(`${MODULE.ID} | ${msg}`, ...args);
        }
    },
    debug: (msg, ...args) => {
        if (getSetting('debug')) {
            console.debug(`${MODULE.ID} | ${msg}`, ...args);
        }
    }
}