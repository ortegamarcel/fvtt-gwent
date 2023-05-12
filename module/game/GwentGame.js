import { GAME_PHASE } from "../constants.js";
import { logger } from "../logger.js";
import Board from "./Board.js";

export class GwentGame {
    id;
    player1;
    player2;
    round = 1;
    turn;
    phase;
    winner;
    board;

    constructor(id) {
        this.id = id;
        this.board = new Board();
        this.phase = GAME_PHASE.waitingForPlayers;
    }

    join(player) {
        if (!this.player1) {
            this.player1 = player;
        } else if (!this.player2) {
            this.player2 = player;
            this._startGame();
        } else {
            logger.warn('Game is already full.');
        }
    }

    async _startGame() {
        if (this.phase != GAME_PHASE.waitingForPlayers) return;

        logger.log('Starting game');
        this.phase = GAME_PHASE.playersPreparingDice;
        await Promise.all([
            this.player1.drawStartingHand(),
            this.player2.drawStartingHand()
        ]);
        logger.log('Started game.');
    }

    cancel() {
        if (this.player1) {
            this._unregisterPlayer(this.player1);
        }
        if (this.player2) {
            this._unregisterPlayer(this.player2);
        }
        this.finished = true;
    }

    _unregisterPlayer(player) {
        const deck = player.isGM
            ? game.items.get(player.deckItemId)
            : game.actors.get(player.actorId).items.get(player.deckItemId);       
        deck.sheet._updateGwentData.call(deck.sheet, { gameId: null });
    }
}