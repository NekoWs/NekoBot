"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.At = void 0;
const Message_1 = require("../Message");
class At extends Message_1.Message {
    constructor(user_id) {
        super({
            type: "at",
            data: { qq: user_id }
        });
    }
}
exports.At = At;
