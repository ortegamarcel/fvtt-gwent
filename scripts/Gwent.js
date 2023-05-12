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