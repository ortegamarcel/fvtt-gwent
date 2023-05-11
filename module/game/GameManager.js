import { MODULE } from '../constants.js';
import { logger } from '../logger.js';
import { genId } from '../utils.js';
import { GwentGame } from './GwentGame.js';

export class GameManager {
    games = new Map();

    static init() {
        logger.debug('Register GameManager');
        game.modules.get(MODULE.ID).api = {
            gameManager: new GameManager()
        };
    }

    startNewGame() {
        const gameId = genId();
        const game = new GwentGame(gameId);
        this.games.set(gameId, game);

        logger.debug(`Created new game with id ${gameId}`);

        return gameId;
    }

    joinGame(gameId, player) {
        const game = this.games.get(gameId);
        if (!game) return;

        game.join(player);
    }

    cancelGame(gameId) {
        logger.log('Canceling game');
        const game = this.games.get(gameId);
        if (!game) return;
        game.cancel();
        this.games.delete(gameId);
    }
}