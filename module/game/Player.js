import { MODULE } from "../constants.js";
import { logger } from "../logger.js";

export class Player {
    actorId = null;
    isGM = false;
    name = null;
    img = null;
    deckItemId = null;
    ready = false;
    hand = null;

    constructor(actorId, name, img) {
        this.isGM = game.user.isGM;
        this.actorId = actorId;
        this.name = name;
        this.img = img;
        this.ready = false;
    }

    async drawStartingHand() {
        const deckItem = game.items.get(this.deckItemId) ?? game.actors.get(this.actorId).items.get(this.deckItemId);

        const deck = await deckItem.getFlag(MODULE.ID, 'data');
        logger.log(`Player ${this.name} draws starting hand from `, deck);
    }
}