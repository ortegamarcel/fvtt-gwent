import { GAME, MODULE } from "../constants.js";
import { Board } from "../game/Board.js";
import { Round } from "../game/Round.js";
import { logger } from "../logger.js";
import { amIPlayer1, isMyTurn } from "../utils.js";

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
            width: 850,
            height: 'auto',
            template: "modules/fvtt-gwent/templates/sheets/actor/board-sheet.html",
        });
    }

    /** @override */
    async getData() {
        const data = super.getData();
        const [player1, player2, currentPlayer, phase, subphase, board, winner] = await Promise.all([
            this.getValueAsync(GAME.PLAYER.p1),
            this.getValueAsync(GAME.PLAYER.p2),
            this.getValueAsync(GAME.PLAYER.current),
            this.getValueAsync(GAME.KEY.phase),
            this.getValueAsync(GAME.KEY.subphase),
            this.getValueAsync(GAME.KEY.board),
            this.getValueAsync(GAME.KEY.winner),
        ]);
        data.data = { player1, player2, currentPlayer, phase, subphase, board, winner };
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
        html.find(".gwent-die.clickable").on("click", this._clickDie.bind(this));
    }

    async reset() {
        await Promise.all([
            this.setValueAsync(GAME.PLAYER.p1, null),
            this.setValueAsync(GAME.PLAYER.p2, null),
            this.setValueAsync(GAME.PLAYER.current, null),
            this.setValueAsync(GAME.KEY.board, null),
            this.setValueAsync(GAME.KEY.phase, GAME.PHASE.waitingForPlayers),
            this.setValueAsync(GAME.KEY.subphase, null),
            this.setValueAsync(GAME.KEY.winner, null),
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

        // Change phase
        await this.setValueAsync(GAME.KEY.phase, GAME.PHASE.playersPreparingDice);
        await this._initBoard();
        await this._initPlayer(GAME.PLAYER.p1);
        await this._initPlayer(GAME.PLAYER.p2);
    }

    /** Init player by defining his starting and deck dice. (Not rolled yet.) */
    async _initPlayer(playerKey) {
        const player = await this.getValueAsync(playerKey);
        const playerDeck = this.actor.items.get(player.deckItemId);
        const data = await playerDeck.sheet.getGwentData();
        const deckDice = Object.entries(data.dice)
            .filter(([tier, _]) => tier != 'total')
            .map(([tier, number]) => Array(number).fill({ tier, value: null }))
            .flat();
        // TODO: Select randomly, instead of last 10.
        const startingDice = deckDice.splice(-10, 10);
        player.deck = deckDice;
        player.dice = startingDice;

        await this.setValueAsync(playerKey, player);
    }

    /** Creates and saves a new Board. */
    async _initBoard() {
        this.setValueAsync(GAME.KEY.board, new Board());
    }

    /** 
     * Click handler for "Roll All" button.
     * Rolls the starting dice of the player. Once both players are ready, the first round will start.
     */
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

    /** Applies some game logic like changing phase and defining start palyer, and starts the first round. */
    async _startRound() {
        await this.setValueAsync(GAME.KEY.phase, GAME.PHASE.startGame);
        await this.setValueAsync(GAME.KEY.turn, GAME.PLAYER.p1);
        await this._nextRound();
    }

    /** Starts the next round. Might be the first round. If 3 rounds were already played, it will start with the finish game logic. */
    async _nextRound() {
        const board = await this.getValueAsync(GAME.KEY.board);
        let previousStartPlayer;
        let newStartPlayer;
        if (!Round.hasStarted(board.round1)) {
            const startingPlayerKey = await this._getStartingPlayerKey();
            await this.setValueAsync(GAME.PLAYER.current, startingPlayerKey);
            Round.start(board.round1, startingPlayerKey);
            await this.setValueAsync(GAME.KEY.board, board);
        } else if (!Round.hasStarted(board.round2)) {
            const winner = Board.getWinner(board);
            Round.end(board.round1, winner);
            previousStartPlayer = board.round1.startPlayer;
            newStartPlayer = previousStartPlayer == GAME.PLAYER.p1 ? GAME.PLAYER.p2 : GAME.PLAYER.p1;
            Round.start(board.round2, newStartPlayer);
            Board.prepareForNewRound(board);
            await this.setValueAsync(GAME.KEY.board, board);
        } else if (!Round.hasStarted(board.round3)) {
            const winner = Board.getWinner(board);
            Round.end(board.round2, winner);
            await this.setValueAsync(GAME.KEY.board, board);

            if (board.round1.winner == board.round2.winner) {
                this._gameFinished();
            } else {
                previousStartPlayer = board.round2.startPlayer;
                newStartPlayer = previousStartPlayer == GAME.PLAYER.p1 ? GAME.PLAYER.p2 : GAME.PLAYER.p1;
                Round.start(board.round3, newStartPlayer);
                Board.prepareForNewRound(board);
                await this.setValueAsync(GAME.KEY.board, board);
            }
        } else {
            const winner = Board.getWinner(board);
            Round.end(board.round3, winner);
            await this.setValueAsync(GAME.KEY.board, board);

            await this._gameFinished();
        }
    }

    async _gameFinished() {
        const board = await this.getValueAsync(GAME.KEY.board);
        // Decide winner
        let player1Wins = 0;
        if (board.round1.winner == GAME.PLAYER.p1) {
            player1Wins++;
        }
        if (board.round2.winner == GAME.PLAYER.p1) {
            player1Wins++;
        }
        if (board.round3.winner == GAME.PLAYER.p1) {
            player1Wins++;
        }
        const gameWinner = player1Wins >= 2 ? GAME.PLAYER.p1 : GAME.PLAYER.p2;
        await this.setValueAsync(GAME.KEY.winner, gameWinner);

        // Change phase
        await this.setValueAsync(GAME.KEY.phase, GAME.PHASE.finished);
    }

    async _clickDie(event) {
        const dataset = event.currentTarget.closest('.gwent-die').dataset;
        const dieIndex = dataset.dieindex;
        const playerKey = dataset.player;
        const gwentData = (await this.getData()).data;

        if (isMyTurn(gwentData)) {
            await this._playDie(playerKey, dieIndex);
            await this._nextPlayerTurn();
        } else {
            ui.notifications.info(game.i18n.localize("GWENT.Notifications.notYourTurn"))
        }
    }

    /** Changes the current player turn, after a player made an action. */
    async _nextPlayerTurn() {
        const gwentData = (await this.getData()).data;
        if (isMyTurn(gwentData)) {
            if (amIPlayer1(gwentData)) {
                if (!gwentData.board.firstPassed) {
                    await this.setValueAsync(GAME.PLAYER.current, await this.getValueAsync(GAME.PLAYER.p2));
                }
            } else {
                if (!gwentData.board.firstPassed) {
                    await this.setValueAsync(GAME.PLAYER.current, await this.getValueAsync(GAME.PLAYER.p1));
                }
            }
        }
    }

    /** Takes a die from the players starting dice and puts/plays it on the board. */
    async _playDie(playerKey, dieIndex) {
        const player = await this.getValueAsync(playerKey);
        const die = player.dice.splice(dieIndex, 1)[0];
        const board = await this.getValueAsync(GAME.KEY.board);
        Board.playDie(board, playerKey, die);

        // save
        await this.setValueAsync(playerKey, player);
        await this.setValueAsync(GAME.KEY.board, board);

        if (!player.dice.length) {
            this._pass(playerKey);
        }
    }

    /** Called when the player clicks "Pass" */
    async _clickPass(playerKey) {
        this._pass(playerKey);
    }

    /** Call when a player passes. I.e. when clicking "Pass" or when he has no more dice left. */
    async _pass(playerKey) {
        const board = await this.getValueAsync(GAME.KEY.board);
        const player = await this.getValueAsync(playerKey);
        player.passed = true;
        Board.playerPassed(board, playerKey);

        // Save
        await this.setValueAsync(playerKey, player);
        await this.setValueAsync(GAME.KEY.board, board);

        const player1 = await this.getValueAsync(GAME.PLAYER.p1);
        const player2 = await this.getValueAsync(GAME.PLAYER.p2);
        if (player1.passed && player2.passed) {
            await this._nextRound();
        }
    }

    /** Returns the starting player key for the first round. */
    async _getStartingPlayerKey() {
        // TODO: For now player 2 begins.
        // Later it should be decided randomly or by the deck types.
        return GAME.PLAYER.p2;
    }
}