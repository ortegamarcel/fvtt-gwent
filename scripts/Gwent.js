import GwentItemSheet from "../module/sheets/GwentItemSheet.js";
import { registerSettings } from "../module/settings.js";
import { MODULE } from "../module/constants.js";


async function preloadHandlebarsTemplates() {
    const templatePath = [
        "modules/fvtt-gwent/templates/sheets/gwent-sheet.html",
    ];
    return loadTemplates(templatePath);
}


Hooks.once("init", function () {
    console.log(`${MODULE.ID} | init module`);

    Items.registerSheet("gwent", GwentItemSheet, { makeDefault: false });

    preloadHandlebarsTemplates();
    registerSettings();
});

Handlebars.registerHelper("not", function (bool) {
    return !bool;
});