export default class Board extends ActorSheet {
    side1 = [];
    side1Total = 0;
    side2 = [];
    side2Total = 0;

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["board", "sheet", "actor"],
            width: 600,
            height: 600,
            template: "modules/fvtt-gwent/templates/sheets/actor/board-sheet.html",
            // tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
        });
    }

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