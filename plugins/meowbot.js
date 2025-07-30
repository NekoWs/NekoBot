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
    apiKey: "sk-b146e6bf44c4432890706a47a0f06201"
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
        let response = yield openAi.chat.completions.create({
            model: "deepseek-chat",
            messages: messages,
            temperature: 1.5
        });
        return response.choices[0].message;
    });
}
module.exports = {
    name: "MeowBot",
    description: "Meow meow...",
    plugin: class MeowPlugin extends AbstractPlugin_1.AbstractPlugin {
        onEnable() {
            const sentences = /([^。?!？！]+[。?!？！]?)/ig;
            this.client.on("group_message", (event) => {
                let message = event.message;
                message.isCue(this.client.bot_id, this.client).then(cue => {
                    if (!cue)
                        return;
                    event.stopPropagation();
                    let sender = event.sender;
                    event.getGroup().then(group => {
                        if (!group)
                            return;
                        let msg = `${sender.nickname}(${sender.user_id}): ${event.message.toString(true)}`;
                        this.logger.info(`[${group.group_name}] ${sender.nickname}: ${msg}`);
                        sendMessage(addMessage(sender.user_id, {
                            role: "user",
                            content: msg
                        })).then(message => {
                            let content = message.content;
                            if (!content)
                                return;
                            this.logger.info("Response:", content);
                            addMessage(sender.user_id, message);
                            if (content.match("BREAK")) {
                                clearMessage(sender.user_id);
                                let mb = new MessageBuilder_1.MessageBuilder();
                                mb.at(sender.user_id)
                                    .append(" ")
                                    .append("不想聊这个话题了喵！");
                                void group.sendMessage(mb.build());
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
                            let delay = 0;
                            for (const msg of marge) {
                                setTimeout(() => {
                                    void group.sendMessage(msg);
                                }, delay);
                                delay += Math.floor(Math.random() * 2000) + 1000;
                            }
                        });
                    });
                });
            });
        }
    }
};
