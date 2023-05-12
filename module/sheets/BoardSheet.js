import { GAME, MODULE } from "../constants.js";
import Board from "../game/Board.js";
import { logger } from "../logger.js";

export default class BoardSheet extends ActorSheet {
    async getValueAsync(key) {
        return this.actor.getFlag(MODULE.ID, key);
    }
    async setValueAsync(key, value) {
        return this.actor.setFlag(MODULE.ID, key, value);
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["board", "sheet", "actor"],
            width: 'auto',
            height: 'auto',
            template: "modules/fvtt-gwent/templates/sheets/actor/board-sheet.html",
        });
    }

    /** @override */
    async getData() {
        const data = super.getData();
        const [player1, player2, phase, subphase, board] = await Promise.all([
            this.getValueAsync(GAME.PLAYER.p1),
            this.getValueAsync(GAME.PLAYER.p2),
            this.getValueAsync(GAME.KEY.phase),
            this.getValueAsync(GAME.KEY.subphase),
            this.getValueAsync(GAME.KEY.board),
        ]);
        data.data = { player1, player2, phase, subphase, board };
        data.game = game;
        data.PHASE = GAME.PHASE;
        data.SUBPHASE = GAME.SUBPHASE;
        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
    
        html.find(".reset-game").on("click", this.reset.bind(this));
        html.find(".roll-all-dice").on("click", this._rollAllDice.bind(this));
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
        player.deckItemId = newDeckItems[0].id;
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
        const player1 = await this.getValueAsync(GAME.PLAYER.p1);
        const player2 = await this.getValueAsync(GAME.PLAYER.p2);
        const player1Deck = this.actor.items.get(player1.deckItemId);
        const player2Deck = this.actor.items.get(player2.deckItemId);
        const data1 = await player1Deck.sheet.getGwentData();
        const data2 = await player2Deck.sheet.getGwentData();
        player1.dice = Object.entries(data1.dice)
            .filter(([tier, _]) => tier != 'total')
            .map(([tier, number]) => Array(number).fill({ tier, value: null }))
            .flat();
        player2.dice = Object.entries(data2.dice)
            .filter(([tier, _]) => tier != 'total')
            .map(([tier, number]) => Array(number).fill({ tier, value: null }))
            .flat();

        // Save players
        await this.setValueAsync(GAME.PLAYER.p1, player1);
        await this.setValueAsync(GAME.PLAYER.p2, player2);
    }

    async _rollAllDice(event) {
        const playerKey = event.currentTarget.closest(".player").dataset.player;
        const player = await this.getValueAsync(playerKey);

        const rollFormula = player.dice.map(die => `1${die.tier}`).join('+');

        const rollResult = await new Roll(rollFormula).evaluate({ async: true });
        rollResult.dice.forEach((die, index) => {
            player.dice[index].value = die.results[0].result;
        });
        player.isReady = true;

        // Save
        await this.setValueAsync(playerKey, player);

        // Check if game can be started
        const player1 = await this.getValueAsync(GAME.PLAYER.p1);
        const player2 = await this.getValueAsync(GAME.PLAYER.p2);
        if (player1.isReady && player2.isReady) {
            this._startRound();
        }
    }

    async _startRound() {
        await this.setValueAsync(GAME.KEY.phase, GAME.PHASE.startGame);
        await this.setValueAsync(GAME.KEY.subphase, GAME.SUBPHASE.round1);
        await this.setValueAsync(GAME.KEY.turn, GAME.PLAYER.p1);
    }

    async _endRound() {

    }
}