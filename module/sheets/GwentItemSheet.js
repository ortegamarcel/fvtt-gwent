import { DEFAULT_DECK, MODULE } from "../constants.js";
import { Player } from "../game/Player.js";
import { getSetting, createValueObj, mergeDeep } from "../utils.js";

export default class GwentItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["gwent", "sheet", "item"],
            width: 520
        });
    }

    get template() {
        return `modules/${MODULE.ID}/templates/sheets/gwent-sheet.html`;
    }

    constructor(object, options) {
        (async () => {
            if (!await object.getFlag(MODULE.ID, 'initialized')) {
                // init gwent data
                await object.setFlag(MODULE.ID, 'initialized', true);
                await object.setFlag(MODULE.ID, 'data', DEFAULT_DECK);
            }
        })()
        super(object, options);
    }

    /** @override */
    async getData() {
        let data = super.getData();
        data.game = game;
        data.data.boardId = await this.object.getFlag(MODULE.ID, 'boardId');

        this.options.classes.push(`item-gwent`)
        if (data.item) {
            data.gwent = data.item.flags[MODULE.ID].data;
        }
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".join-game").on("click", this.joinGame.bind(this));
        html.find(".show-board").on("click", this.showBoard.bind(this));
    }

    /** @override */
    async _updateObject(event, formData) {
        super._updateObject(event, formData);

        // Calculate total number of dice
        const total = Object.entries(formData)
            .filter(([d, _]) => d.includes('data.dice.d'))
            .reduce((total, [_, x]) => total += x, 0);

        // Update weight of item
        const weightProp = getSetting('weightProp');
        let weightObj = {};
        createValueObj(weightObj, weightProp, total * 0.01);
        this.object.update(weightObj);

        // Update total and isComplete
        await this._updateGwentData({ isComplete: total >= 10, dice: { total } });
    }

    async joinGame(event, name) {
        if (this.object.flags[MODULE.ID].data.dice.total < 10) {
            ui.notifications.warn(game.i18n.localize("GWENT.Notifications.notEnoughDice"));
            return;
        }
        const boardId = await this.object.getFlag(MODULE.ID, 'boardId');
        if (!boardId) {
            const player = this._createPlayer(name);
            const boardId = getSetting('boardId');
            await this.object.setFlag(MODULE.ID, 'boardId', boardId);
            const boardSheet = game.actors.get(boardId).sheet;
            boardSheet.render(true);
            boardSheet.joinGame(player, this.item);
        } else {
            ui.notifications.warn(game.i18n.localize("GWENT.Notifications.deckAlreadyUsed"));
        }
    }

    async showBoard() {
        const boardId = await this.object.getFlag(MODULE.ID, 'boardId');
        if (boardId) {
            game.actors.get(boardId).sheet.render(true);
        } else {
            ui.notifications.warn(game.i18n.localize("GWENT.Notifications.deckNotUsed"));
        }
    }

    _createPlayer(name) {
        // TODO: In future, the GM should be able to enter a display name, i.e. the name of the NPC against the player is playing
        return new Player(this.actor?.id, name ?? this.actor?.name ?? game.user.name, this.actor?.img);
    }

    async getGwentData() {
        return this.object.getFlag(MODULE.ID, 'data');
    }

    async _updateGwentData(dataPartial) {
        const data = await this.getGwentData();
        const update = mergeDeep({}, data, dataPartial);
        this.object.setFlag(MODULE.ID, 'data', update);
    }
}