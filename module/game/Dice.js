export class Dice {
    /** Can be d4, d6, d8, d10 or d12. */
    tier;

    /** The value that was rolled. */
    value = null;

    constructor(tier) {
        this.tier = tier;
    }

    async roll() {
        const roll = await new Roll(`1${this.tier}`).evaluate({ async: true });
        this.value = Number(roll.total);
    }
}