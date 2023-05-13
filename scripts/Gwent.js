import GwentItemSheet from "../module/sheets/GwentItemSheet.js";
import { registerSettings } from "../module/settings.js";
import { MODULE } from "../module/constants.js";
import BoardSheet from "../module/sheets/BoardSheet.js";
import { amIPlayer, amIPlayer1, amIPlayer2, amISpectator, isMyTurn } from "../module/utils.js";
import { Round } from "../module/game/Round.js";

async function preloadHandlebarsTemplates() {
    const templatePath = [
        "modules/fvtt-gwent/templates/sheets/gwent-sheet.html",
        "modules/fvtt-gwent/templates/partials/gwent-die.html",
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

Handlebars.registerHelper("isMyTurn", isMyTurn);

Handlebars.registerHelper("amIPlayer1", amIPlayer1);

Handlebars.registerHelper("amIPlayer2", amIPlayer2);

Handlebars.registerHelper("amIPlayer", amIPlayer);

Handlebars.registerHelper("amISpectator", amISpectator);

Handlebars.registerHelper("isRunning", Round.isRunning);

Handlebars.registerHelper("hasStarted", Round.hasStarted);

Handlebars.registerHelper("hasFinished", Round.hasFinished);
