"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Text = void 0;
const Message_1 = require("../Message");
class Text extends Message_1.Message {
    constructor(message) {
        super({
            type: "text",
            data: { text: message }
        });
    }
}
exports.Text = Text;
