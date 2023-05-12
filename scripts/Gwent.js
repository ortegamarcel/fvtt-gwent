import GwentItemSheet from "../module/sheets/GwentItemSheet.js";
import { registerSettings } from "../module/settings.js";
import { MODULE } from "../module/constants.js";
import BoardSheet from "../module/sheets/BoardSheet.js";

async function preloadHandlebarsTemplates() {
    const templatePath = [
        "modules/fvtt-gwent/templates/sheets/gwent-sheet.html",
    ];
    return loadTemplates(templatePath);
}

Hooks.once("init", function () {
    console.log(`${MODULE.ID} | init module`);

    Items.registerSheet("gwent", GwentItemSheet, { makeDefault: false });
    Actors.registerSheet("gwent", BoardSheet, { makeDefault: false });

    preloadHandlebarsTemplates();
    registerSettings();
});

Handlebars.registerHelper("not", function (bool) {
    return !bool;
});

Handlebars.registerHelper("concat", function (...str) {
    return str.slice(0, -1).join("");
});

Handlebars.registerHelper("isMyTurn", function (gwentData) {
    if (!gwentData.currentPlayer) return false;

    return gwentData.currentPlayer.isGM == game.user.isGM
        || gwentData.currentPlayer.actorId == game.user.character?.id;
});

Handlebars.registerHelper("amISpectator", function (gwentData) {
    if (!gwentData.currentPlayer || !gwentData.player1 || !gwentData.player2) {
        return false;
    }

    return gwentData.player1.isGM != game.user.isGM
        && gwentData.player1.actorId != game.user.character?.id
        && gwentData.player2.isGM != game.user.isGM
        && gwentData.player2.actorId != game.user.character?.id;
});