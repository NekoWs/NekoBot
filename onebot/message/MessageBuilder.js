"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBuilder = void 0;
const MessageChain_1 = require("./MessageChain");
const At_1 = require("./messages/At");
const Reply_1 = require("./messages/Reply");
const Face_1 = require("./messages/Face");
const Text_1 = require("./messages/Text");
const Message_1 = require("./Message");
/**
 * 消息构造器
 */
class MessageBuilder {
    constructor() {
        this.chain = new MessageChain_1.MessageChain();
    }
    get size() {
        return this.chain.size;
    }
    /**
     * 追加 AT 消息
     *
     * @param user_id QQ
     */
    at(user_id) {
        return this.append(new At_1.At(user_id));
    }
    /**
     * 追加回复消息
     *
     * @param message_id 消息ID
     */
    reply(message_id) {
        return this.append(new Reply_1.Reply(message_id));
    }
    /**
     * 追加表情消息
     *
     * @param face_id 表情ID
     */
    face(face_id) {
        return this.append(new Face_1.Face(face_id));
    }
    /**
     * 追加消息，如果类型为 string 则添加文本消息
     *
     * @param message 消息
     */
    append(message) {
        let msg;
        if (message instanceof Message_1.Message) {
            msg = message;
        }
        else {
            msg = new Text_1.Text(message);
        }
        this.chain.chain.push(msg);
        return this;
    }
    /**
     * 构造消息链
     */
    build() {
        return this.chain;
    }
}
exports.MessageBuilder = MessageBuilder;
