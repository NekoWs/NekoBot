"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageChain = void 0;
const Message_1 = require("./Message");
/**
 * 消息链
 */
class MessageChain {
    constructor(payload = []) {
        this.chain = [];
        for (let msg of payload) {
            this.chain.push(new Message_1.Message(msg));
        }
    }
    /**
     * 获取消息链长度
     */
    get size() {
        return this.chain.length;
    }
    /**
     * 将消息链转换为 JSON 格式
     */
    toJson() {
        let result = [];
        this.chain.forEach(msg => {
            result.push(msg.toJson());
        });
        return result;
    }
    /**
     * 将消息链转换为文本格式
     *
     * @param normal 是否文本化
     */
    toString(normal = true) {
        let result = "";
        for (let msg of this.chain) {
            if (msg.type === "text") {
                result += msg.data.text;
                continue;
            }
            if (normal) {
                result += "[" + Message_1.MessageTypeMap[msg.type];
                if (msg.type === "at") {
                    result += msg.data.qq;
                }
                result += "]";
            }
            else {
                result +=
                    `[ONEBOT:${msg.type}:` +
                        `${JSON.stringify(msg.data)
                            .replace(":", "\\:")}]`;
            }
        }
        return result;
    }
}
exports.MessageChain = MessageChain;
