"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractPlugin = void 0;
const Logger_1 = require("../utils/Logger");
class AbstractPlugin {
    constructor(name, description, client) {
        this.name = name;
        this.description = description;
        this.logger = new Logger_1.Logger(this.name);
        this.client = client;
    }
}
exports.AbstractPlugin = AbstractPlugin;
