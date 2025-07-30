"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reply = void 0;
const Message_1 = require("../Message");
class Reply extends Message_1.Message {
    constructor(message_id) {
        super({
            type: "reply",
            data: { id: message_id }
        });
    }
}
exports.Reply = Reply;
