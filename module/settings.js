import { MODULE } from "./constants.js";

export const registerSettings = function() {
    game.settings.register(MODULE.ID, "gameName", {
        name: "GWENT.Settings.gameName",
        name: "GWENT.Settings.gameNameHint",
        scope: "world",
        config: true,
        type: String,
        default: 'Gwen\'t'
    });
    game.settings.register(MODULE.ID, "weightProp", {
        name: "GWENT.Settings.weightProp",
        name: "GWENT.Settings.weightPropHint",
        scope: "world",
        config: true,
        type: String,
        default: 'system.weight'
    });
}