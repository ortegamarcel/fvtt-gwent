export const MODULE = {
    ID: 'fvtt-gwent'
};

/** Used when creating a new deck item. */
export const DEFAULT_DECK = {
    type: 'monsters',
    isComplete: true,
    gameId: null,
    dice: {
        d4: 3,
        d6: 3,
        d8: 3,
        d10: 1,
        d12: 0,
        total: 10
    }
};

export const GAME = {
    PHASE: {
        waitingForPlayers: 'waitingForPlayers',
        playersPreparingDice: 'playersPreparingDice',
        startGame: 'startGame',
        finished: 'finished',
        canceled: 'canceled',
    },
    SUBPHASE: {
        round1: 'round1',
        round2: 'round2',
        round3: 'round3',
    },
    PLAYER: {
        p1: 'player1',
        p2: 'player2',
        current: 'currentPlayer',
    },
    KEY: {
        phase: 'phase',
        subphase: 'subphase',
        board: 'board',
        currentPlayer: 'currentPlayer',
        winner: 'winner',
    }
};
