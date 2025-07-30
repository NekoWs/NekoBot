"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateMessageEvent = void 0;
const MessageEvent_1 = require("./MessageEvent");
/**
 * 私聊事件
 */
class PrivateMessageEvent extends MessageEvent_1.MessageEvent {
    constructor(payload) {
        super(payload);
    }
}
exports.PrivateMessageEvent = PrivateMessageEvent;
