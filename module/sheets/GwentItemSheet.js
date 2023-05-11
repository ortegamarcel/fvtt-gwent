import { DEFAULT_DECK, MODULE } from "../constants.js";
import { getSetting, createValueObj } from "../utils.js";

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
    getData() {
        let data = super.getData();
        data.game = game;

        this.options.classes.push(`item-gwent`)
        if (data.item) {
            data.gwent = data.item.flags[MODULE.ID].data;
        }
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // html.find(".save").on("click", this.save.bind(this));
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
        const data = await this.object.getFlag(MODULE.ID, 'data');
        await this.object.setFlag(MODULE.ID, 'data', { ...data, isComplete: total >= 10, dice: { ...data.dice, total } });
    }
}