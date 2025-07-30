"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Json = void 0;
const Message_1 = require("../Message");
class Json extends Message_1.Message {
    constructor(data) {
        super({
            type: "json",
            data: { data: data }
        });
    }
}
exports.Json = Json;
