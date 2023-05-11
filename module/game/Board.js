export class Board {
    side1 = [];
    side1Total = 0;
    side2 = [];
    side2Total = 0;

    clear() {
        this.side1.clear();
        this.side2.clear();
        this.side1Total = 0;
        this.side2Total = 0;
    }

    put(side, dice) {
        if (side == 'side1') {
            this.side1.push(dice);
            this.side1Total += dice.value;
        } else {
            this.side2.push(dice);
            this.side2Total += dice.value;
        }
    }
}