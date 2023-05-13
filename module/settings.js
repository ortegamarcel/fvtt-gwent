import { MODULE } from "./constants.js";

export const registerSettings = function() {
    game.settings.register(MODULE.ID, "gameName", {
        name: "GWENT.Settings.gameName",
        hint: "GWENT.Settings.gameNameHint",
        scope: "world",
        config: true,
        type: String,
        default: 'Gwen\'t'
    });
    game.settings.register(MODULE.ID, "weightProp", {
        name: "GWENT.Settings.weightProp",
        hint: "GWENT.Settings.weightPropHint",
        scope: "world",
        config: true,
        type: String,
        default: 'system.weight'
    });
    game.settings.register(MODULE.ID, "boardId", {
        name: "GWENT.Settings.boardId",
        hint: "GWENT.Settings.boardIdHint",
        scope: "world",
        config: true,
        type: String,
        default: null
    });
    game.settings.register(MODULE.ID, "deckIds", {
        name: "GWENT.Settings.deckIds",
        hint: "GWENT.Settings.deckIdsHint",
        scope: "world",
        config: true,
        type: String,
        default: null
    });
    game.settings.register(MODULE.ID, "debug", {
        name: "Debug",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });
}