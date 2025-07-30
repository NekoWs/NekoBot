"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
class Plugin {
    constructor(path, client) {
        this.enabled = false;
        this.module = require("../../../plugins/" + path);
        this.plugin = new this.module.plugin(this.module.name, this.module.description, client);
        this.path = path;
    }
    onEnable() {
        this.enabled = true;
        this.plugin.onEnable();
    }
}
exports.Plugin = Plugin;
