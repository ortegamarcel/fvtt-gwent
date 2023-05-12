export class Player {
    actorId = null;
    isGM = false;
    name = null;
    img = null;
    deckItemId = null;
    isReady = false;
    dice = [];

    constructor(actorId, name, img) {
        this.isGM = game.user.isGM;
        this.actorId = actorId;
        this.name = name;
        this.img = img;
        this.isReady = false;
        this.dice = [];
    }
}