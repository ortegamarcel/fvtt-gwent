export const MODULE = {
    ID: 'fvtt-gwent'
};

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
        round1: 'round1',
        round2: 'round2',
        round3: 'round3',
        finished: 'finished',
        canceled: 'canceled',
    },
    PLAYER: {
        p1: 'player1',
        p2: 'player2',
    }
};
