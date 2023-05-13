import { GAME } from "../constants.js";
import { logger } from "../logger.js";
import { Round } from "./Round.js";

export class Board {
    side1 = [];
    side1Total = 0;
    side2 = [];
    side2Total = 0;
    round1 = new Round();
    round2 = new Round();
    round3 = new Round();
    /** The player key who first passed the round. This player wins the round on a draw. */
    firstPassed = null;

    static prepareForNewRound(board) {
        board.side1 = [];
        board.side2 = [];
        board.side1Total = 0;
        board.side2Total = 0;
        board.firstPassed = null;
    }

    static playerPassed(board, playerKey) {
        if (!board.firstPassed) {
            board.firstPassed = playerKey;
        }
    }

    /** Returns the player key of the winner */
    static getWinner(board) {
        if (board.firstPassed == GAME.PLAYER.p1) {
            return board.side1Total >= board.side2Total ? GAME.PLAYER.p1 : GAME.PLAYER.p2;
        } else if (board.firstPassed == GAME.PLAYER.p2) {
            return board.side2Total >= board.side1Total ? GAME.PLAYER.p2 : GAME.PLAYER.p1;
        } else {
            logger.error('Attempts to determine the winner without a player having passed');
        }
    }

    static playDie(board, playerKey, die) {
        if (playerKey == GAME.PLAYER.p1) {
            board.side1.push(die);
            board.side1Total += die.value;
        } else {
            board.side2.push(die);
            board.side2Total += die.value;
        }
    }

    // static getCurrentRound(board) {
    //     if (Round.isRunning(board.round1)) {
    //         return board.round1;
    //     } else if (Round.isRunning(board.round2)) {
    //         return board.round2;
    //     } else if (Round.isRunning(board.round3)) {
    //         return board.round3;
    //     } else {
    //         return null;
    //     }
    // }
}