import { logger } from '../logger.js';

export class Deck {
    dice = null;
    name = null;
    complete = false;
    actorId = null;

    constructor(dice, name, actorId) {
        if (!dice || !Array.isArray(dice) || dice.length < 10) {
            logger.error('A deck must have at least 10 dice.');
        }
        this.dice = dice;
        this.name = name || 'Default Deck';
        this.actorId = actorId;
    }
}