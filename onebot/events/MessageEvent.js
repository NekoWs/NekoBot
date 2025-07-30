"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageEvent = void 0;
const Event_1 = require("./Event");
const MessageChain_1 = require("../message/MessageChain");
const Sender_1 = require("../contact/Sender");
class MessageEvent extends Event_1.Event {
    /**
     * 消息事件
     * @param payload 原数据
     */
    constructor(payload) {
        super(payload);
        this.message_type = payload.message_type;
        this.sub_type = payload.sub_type || "native";
        this.message_id = payload.message_id;
        this.message = new MessageChain_1.MessageChain(payload.message);
        this.raw_message = payload.raw_message;
        this.font = payload.font;
        this.sender = new Sender_1.Sender(payload.sender);
        this.user_id = payload.user_id || this.sender.user_id;
    }
}
exports.MessageEvent = MessageEvent;
