import { DEFAULT_DECK, MODULE } from "../constants.js";
import { Player } from "../game/Player.js";
import { logger } from "../logger.js";
import { getSetting, createValueObj, mergeDeep } from "../utils.js";
import Board from "../game/Board.js";

export default class GwentItemSheet extends ItemSheet {
    gwentDataProp;

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["gwent", "sheet", "item"],
            width: 520,
            //   tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
            //   dragDrop: [{
            //     dragSelector: ".items-list .item",
            //     dropSelector: null
            //   }],
        });
    }

    get template() {
        return `modules/${MODULE.ID}/templates/sheets/gwent-sheet.html`;
    }

    // get gameManager() {
    //     return game.modules.get(MODULE.ID).api.gameManager;
    // }

    constructor(object, options) {
        (async () => {
            if (!await object.getFlag(MODULE.ID, 'initialized')) {
                // init gwent data
                await object.setFlag(MODULE.ID, 'initialized', true);
                await object.setFlag(MODULE.ID, 'data', DEFAULT_DECK);
            }
            // this._updateGwentData({ boardId: null });
        })()
        super(object, options);
    }

    /** @override */
    getData() {
        let data = super.getData();
        data.game = game;

        this.options.classes.push(`item-gwent`)
        if (data.item) {
            data.gwent = data.item.flags[MODULE.ID].data;
            // if (data.gwent.gameId) {
            //     data.gwentGame = this.gameManager.games.get(data.gwent.gameId);
            // }
        }
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".start-game").on("click", this._startNewGame.bind(this));
        // html.find(".join-game").on("click", this._joinGame.bind(this));
        // html.find(".cancel-game").on("click", this._cancelGame.bind(this));
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
        // const data = await this.object.getFlag(MODULE.ID, 'data');
        await this._updateGwentData({ isComplete: total >= 10, dice: { total } });
        // await this.object.setFlag(MODULE.ID, 'data', { ...data, isComplete: total >= 10, dice: { ...data.dice, total } });
    }

    async _startNewGame() {
        // if (!(await this._getGwentData()).gameId) {
        //     const gameId = this.gameManager.startNewGame();
        //     this.gameManager.joinGame(gameId, this._createPlayer());
        //     await this._updateGwentData({ gameId });
        // }
        // const board = new Board();
        // game.actors.push(board);
        const player = this._createPlayer();
        const boardId = getSetting('boardId');
        game.actors.get(boardId).sheet.joinGame(player, this.item);
    }

    async _joinGame() {
        logger.info('Joining game');
        // const gameId = document.querySelector('#join-game-id').value.trim();
        // this.gameManager.joinGame(gameId, this._createPlayer());
        // await this._updateGwentData({ gameId });
    }

    _createPlayer() {
        return new Player(this.actor?.id, this.actor?.name ?? game.user.name, this.actor?.img, this.item.id);
    }

    async _cancelGame() {
        // const gameId = this.getData().gwent.gameId;
        // this.gameManager.cancelGame(gameId);
        // await this._updateGwentData({ gameId: null });
    }

    async _getGwentData() {
        return this.object.getFlag(MODULE.ID, 'data');
    }

    async _updateGwentData(dataPartial) {
        const data = await this._getGwentData();
        const update = mergeDeep({}, data, dataPartial);
        this.object.setFlag(MODULE.ID, 'data', update);
    }

}