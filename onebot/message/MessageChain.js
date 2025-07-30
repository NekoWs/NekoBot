"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    isCue(id, client) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let msg of this.chain) {
                if (msg.type === "at") {
                    if (msg.data.qq == id) {
                        return true;
                    }
                }
                else if (msg.type === "reply") {
                    try {
                        client.getMsg(msg.data.id).then(msg => {
                            if (msg.sender.user_id == id) {
                                return true;
                            }
                        }).catch(() => { });
                    }
                    catch (e) { }
                }
            }
            return false;
        });
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
