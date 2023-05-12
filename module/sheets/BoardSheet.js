import { GAME, MODULE } from "../constants.js";
import Board from "../game/Board.js";
import { logger } from "../logger.js";

export default class BoardSheet extends ActorSheet {
    async getValueAsync(key) {
        return await this.actor.getFlag(MODULE.ID, key);
    }
    async setValueAsync(key, value) {
        await this.actor.setFlag(MODULE.ID, key, value);
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["board", "sheet", "actor"],
            width: 600,
            height: 600,
            template: "modules/fvtt-gwent/templates/sheets/actor/board-sheet.html",
        });
    }

    constructor(...args) {
        super(...args);
        this.setValueAsync(GAME.KEY.board, new Board());
        this.setValueAsync(GAME.KEY.phase, GAME.PHASE.waitingForPlayers);
    }

    /** @override */
    async getData() {
        const data = super.getData();
        const [player1, player2, phase, board] = await Promise.all([
            this.getValueAsync(GAME.PLAYER.p1),
            this.getValueAsync(GAME.PLAYER.p2),
            this.getValueAsync(GAME.KEY.phase),
            this.getValueAsync(GAME.KEY.board),
        ]);
        data.data = { player1, player2, phase, board };
        data.game = game;
        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
    
        html.find(".reset-game").on("click", this.reset.bind(this));
    }

    async reset() {
        await Promise.all([
            this.setValueAsync(GAME.PLAYER.p1, null),
            this.setValueAsync(GAME.PLAYER.p2, null),
            this.setValueAsync(GAME.KEY.board, new Board()),
            this.setValueAsync(GAME.KEY.phase, GAME.PHASE.waitingForPlayers),
            this.actor.deleteEmbeddedDocuments('Item', this.actor.items.map(i => i.id))
        ]);
    }

    async joinGame(player, deckItem) {
        const [player1, player2, newDeckItems] = await Promise.all([
            this.getValueAsync(GAME.PLAYER.p1),
            this.getValueAsync(GAME.PLAYER.p2),
            this.actor.createEmbeddedDocuments('Item', [deckItem])
        ]);
        player = {
            ...player,
            deckItemId: newDeckItems[0].id
        };
        if (!player1) {
            await this.setValueAsync(GAME.PLAYER.p1, player);
        } else if (!player2) {
            await this.setValueAsync(GAME.PLAYER.p2, player);
            await this._startGame();
        } else {
            ui.notifications.info('Others are already playing');
        }
    }

    async _startGame() {
        logger.log('Starting game');
        await this.setValueAsync(GAME.KEY.phase, GAME.PHASE.playersPreparingDice);
        const player1 = { ...(await this.getValueAsync(GAME.PLAYER.p1)) };
        const player2 = { ...(await this.getValueAsync(GAME.PLAYER.p2)) };
        const player1Deck = this.actor.items.get(player1.deckItemId);
        const player2Deck = this.actor.items.get(player2.deckItemId);
    }

    async _rollStartingHandPlayer1() {
        this._rollStartingHand(GAME.PLAYER.p1);
    }
    
    async _rollStartingHandPlayer1() {
        this._rollStartingHand(GAME.PLAYER.p2);
    }

    async _rollStartingHand(playerKey) {
        const player = await this.getValueAsync(playerKey);
        const deck = this.actor.items.get(player.deckItemId);
        const deckData = await deck.getGwentData();
        
    }
}