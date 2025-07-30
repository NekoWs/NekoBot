"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = void 0;
const MessageChain_1 = require("../message/MessageChain");
const Action_1 = require("../utils/Action");
const MessageBuilder_1 = require("../message/MessageBuilder");
class Contact {
    constructor(payload, client) {
        this.user_id = payload.user_id;
        this.nickname = payload.nickname;
        this.client = client;
    }
    /**
     * 发送私聊消息
     *
     * @param message 消息
     */
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            let chain;
            if (message instanceof MessageChain_1.MessageChain) {
                chain = message;
            }
            else {
                let mb = new MessageBuilder_1.MessageBuilder();
                chain = mb.append(message).build();
            }
            this.client.send(new Action_1.Action("send_private_msg", {
                user_id: this.user_id,
                message: chain.toJson(),
            })).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message);
                    return;
                }
                if (!data.data) {
                    resolve(-1);
                }
                else {
                    resolve(data.data.message_id);
                }
            }).catch(reject);
        });
    }
}
exports.Contact = Contact;
