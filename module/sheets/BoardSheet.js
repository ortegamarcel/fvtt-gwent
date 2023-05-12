import { GAME, MODULE } from "../constants.js";
import Board from "../game/Board.js";
import { logger } from "../logger.js";

export default class BoardSheet extends ActorSheet {
    async getPlayer1() {
        return this.actor.getFlag(MODULE.ID, GAME.PLAYER.p1);
    }
    async setPlayer1(player) {
        this.actor.setFlag(MODULE.ID, GAME.PLAYER.p1, player);
    }
    async getPlayer2() {
        return this.actor.getFlag(MODULE.ID, GAME.PLAYER.p2);
    }
    async setPlayer2(player) {
        this.actor.setFlag(MODULE.ID, GAME.PLAYER.p2, player);
    }
    async getBoard() {
        return this.actor.getFlag(MODULE.ID, 'board');
    }
    async setBoard(value) {
        this.actor.setFlag(MODULE.ID, 'board', value);
    }
    async getPhase() {
        return this.actor.getFlag(MODULE.ID, 'phase');
    }
    async setPhase(value) {
        this.actor.setFlag(MODULE.ID, 'phase', value);
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
        this.setBoard(new Board());
        this.setPhase(GAME.PHASE.waitingForPlayers);
    }

    /** @override */
    async getData() {
        const data = super.getData();
        const [player1, player2, phase, board] = await Promise.all([
            this.getPlayer1(),
            this.getPlayer2(),
            this.getPhase(),
            this.getBoard()
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
            this.setPlayer1(null),
            this.setPlayer2(null),
            this.setBoard(new Board()),
            this.setPhase(GAME.PHASE.waitingForPlayers),
            this.actor.deleteEmbeddedDocuments('Item', this.actor.items.map(i => i.id))
        ]);
    }

    async joinGame(player, deckItem) {
        const [player1, player2, newDeckItem] = await Promise.all([
            this.getPlayer1(),
            this.getPlayer2(),
            this.actor.createEmbeddedDocuments('Item', [deckItem])
        ])
        player.deckItemId = newDeckItem.id;
        if (!player1) {
            await this.setPlayer1(player);
        } else if (!player2) {
            await this.setPlayer2(player);
            this._startGame();
        } else {
            ui.notification.info('Others are already playing');
        }
    }

    async _startGame() {
        logger.debug('Starting game');
        await this.setPhase(GAME.PHASE.playersPreparingDice);
    }
}