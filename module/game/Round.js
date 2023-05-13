export class Round {
    /** The player key who started the round. I.e. GAME.PLAYER.p1 */
    startPlayer = null;
    /** The player key who won the round. I.e. GAME.PLAYER.p2 */
    winner = null;

    static hasStarted(round) {
        return !!round?.startPlayer;
    }

    static isRunning(round) {
        return round?.startPlayer && !round?.winner;
    }

    static hasFinished(round) {
        return !!round?.winner;
    }

    static start(round, startPlayerKey) {
        if (!round) return;
        round.startPlayer = startPlayerKey;
    }

    static end(round, winnerPlayerKey) {
        if (!round) return;
        round.winner = winnerPlayerKey;
    }
}