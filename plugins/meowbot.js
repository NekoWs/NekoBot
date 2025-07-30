"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.addMessage = addMessage;
exports.clearMessage = clearMessage;
const AbstractPlugin_1 = require("../src/nekobot/plugin/AbstractPlugin");
const openai_1 = require("openai");
const fs = __importStar(require("node:fs"));
const MessageBuilder_1 = require("../onebot/message/MessageBuilder");
const openAi = new openai_1.OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: fs.readFileSync("api-key.txt", "utf-8")
});
let messages = {};
let prompt = fs.readFileSync("./prompt.txt", "utf8");
let emptyMsg = [
    {
        role: "system",
        content: prompt
    }, {
        role: "assistant",
        content: "明白了喵！"
    }
];
function emptyMessage() {
    return [...emptyMsg];
}
function getMessage(id) {
    return messages[id] || emptyMessage();
}
function addMessage(id, message) {
    let msg = getMessage(id);
    if (!message) {
        return msg;
    }
    msg.push({
        role: message.role,
        content: message.content,
    });
    messages[id] = msg;
    return msg;
}
function clearMessage(id) {
    messages[id] = emptyMessage();
}
function sendMessage(messages) {
    return __awaiter(this, void 0, void 0, function* () {
        return openAi.chat.completions.create({
            model: "deepseek-chat",
            messages: messages,
            temperature: 1.5
        }).then(response => {
            return response.choices[0].message;
        }).catch(e => {
            return null;
        });
    });
}
const queue = [];
module.exports = {
    name: "MeowBot",
    description: "Meow meow...",
    plugin: class MeowPlugin extends AbstractPlugin_1.AbstractPlugin {
        onEnable() {
            const sentences = /([^。?!？！]+[。?!？！]?)/ig;
            let lastMessage = -1;
            let typing = false;
            setInterval(() => {
                if (queue.length < 1 || typing)
                    return;
                let current = queue[0];
                let messages = current.messages;
                if (messages.length < 1) {
                    queue.shift();
                    return;
                }
                let msg = messages.shift();
                let mb = new MessageBuilder_1.MessageBuilder();
                if (lastMessage != current.message_id) {
                    mb.reply(current.message_id);
                }
                mb.append(msg);
                lastMessage = current.message_id;
                typing = true;
                setTimeout(() => {
                    this.client.sendGroupMessage(current.group_id, mb.build()).catch(e => {
                        this.logger.error("发送消息失败：", e);
                    });
                    typing = false;
                }, msg.length * 300);
            }, 100);
            this.client.on("group_message", (event) => {
                let message = event.message;
                message.isCue(this.client.bot_id, this.client).then(cue => {
                    if (!cue)
                        return;
                    let sender = event.sender;
                    event.getGroup().then(group => {
                        if (!group)
                            return;
                        let msg = `${sender.nickname}(${sender.user_id}): ${event.message.toString(true)}`;
                        // 最大处理字数 300
                        if (msg.length > 300) {
                            group.sendMessage(new MessageBuilder_1.MessageBuilder()
                                .at(sender.user_id)
                                .append(" 好多字... 咱看不过来了...")
                                .build()).catch(e => { });
                            return;
                        }
                        this.logger.info(`[${group.group_name}] ${msg}`);
                        // 停止传播事件
                        event.stopPropagation();
                        sendMessage(addMessage(sender.user_id, {
                            role: "user",
                            content: msg.replace(`[@${event.self_id}]`, "")
                        })).then(message => {
                            if (!message)
                                return;
                            let content = message.content;
                            if (!content)
                                return;
                            addMessage(sender.user_id, message);
                            if (content.match("BREAK")) {
                                clearMessage(sender.user_id);
                                let mb = new MessageBuilder_1.MessageBuilder();
                                mb.at(sender.user_id)
                                    .append(" ")
                                    .append("不想聊这个话题了喵！");
                                group.sendMessage(mb.build()).catch(e => {
                                    this.logger.warn("发送消息失败：", e);
                                });
                                return;
                            }
                            let messages = content.match(sentences) || [];
                            let marge = [];
                            let buf = "";
                            // 合并短消息，比如 “喵？” 不应该单独发送
                            messages.forEach(msg => {
                                if (buf.length < 5) {
                                    buf += msg;
                                    return;
                                }
                                marge.push(buf);
                                buf = msg;
                            });
                            marge.push(buf);
                            // 将消息添加进队列
                            queue.push({
                                messages: marge,
                                group_id: event.group_id,
                                user_id: sender.user_id,
                                message: event.message_id
                            });
                            // let delay = 0
                            // for (const msg of marge) {
                            //     setTimeout(() => {
                            //         void group.sendMessage(msg).catch(e => {
                            //             this.logger.warn("发送消息失败：", e)
                            //         })
                            //     }, delay)
                            //     delay += Math.floor(Math.random() * 2000) + 1000
                            // }
                        }).catch(e => {
                            this.logger.warn("发送消息失败：", e);
                        });
                    }).catch(e => {
                        this.logger.warn("获取群信息失败：", e);
                    });
                }).catch(e => {
                    this.logger.warn("获取相关性失败：", e);
                });
            });
        }
    }
};
