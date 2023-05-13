export class Player {
    /** The actor this player belongs to. Might be null, if it belongs to the GM. */
    actorId = null;
    /** If the player belongs to the GM. */
    isGM = false;
    /** The name of the player that will be shown on the board. */
    name = null;
    /** The optional image of the player that will be shown on the board. A default image will be shown, if no image is provided. */
    img = null;
    /** The GwentItem id that belongs to the player. Is needed to generade the players dice (hand) and deck to play with. */
    deckItemId = null;
    /** 
     * The original GwentItem id from which the new deck item for the game is created.
     * This deck item has the board id stored, which needs to be deleted once the game finished. 
     */
    deckSourceItemId = null;
    /** The status, if the round can start. True, after the player rolled his starting dice. */
    isReady = false;
    /** The starting dice to play a game. Derived from the GwentItem (`deckItemId`) */
    dice = [];
    /** The remaining dice that are not in his starting hand, if the DeckItem has more than 10 dice. Not used yet. */
    deck = [];
    /** If the game started, this indicates if the player already passed the current round. */
    passed = false;

    constructor(actorId, name, img) {
        this.isGM = game.user.isGM;
        this.actorId = actorId;
        this.name = name;
        this.img = img;
        this.isReady = false;
        this.dice = [];
    }
}