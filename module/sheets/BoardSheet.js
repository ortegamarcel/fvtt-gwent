import { GAME, MODULE } from "../constants.js";
import Board from "../game/Board.js";
import { logger } from "../logger.js";

export default class BoardSheet extends ActorSheet {
    async getValue(key) {
        return await this.actor.setFlag(MODULE.ID, key);
    }
    async setValue(key, value) {
        await this.actor.setFlag(MODULE.ID, key, value);
    }
    async getValueAsync(key) {
        return this.actor.setFlag(MODULE.ID, key);
    }
    async setValueAsync(key, value) {
        this.actor.setFlag(MODULE.ID, key, value);
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
        this.setValue(GAME.KEY.board, new Board());
        this.setValue(GAME.KEY.phase, GAME.PHASE.waitingForPlayers);
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
        const [player1, player2, newDeckItem] = await Promise.all([
            this.getValueAsync(GAME.PLAYER.p1),
            this.getValueAsync(GAME.PLAYER.p2),
            this.actor.createEmbeddedDocuments('Item', [deckItem])
        ])
        player.deckItemId = newDeckItem.id;
        if (!player1) {
            await this.setValueAsync(GAME.PLAYER.p1, player);
        } else if (!player2) {
            await this.setValueAsync(GAME.PLAYER.p2, player);
            this._startGame();
        } else {
            ui.notification.info('Others are already playing');
        }
    }

    _startGame() {
        logger.debug('Starting game');
        this.setValue(GAME.KEY.phase, GAME.PHASE.playersPreparingDice);
    }
}