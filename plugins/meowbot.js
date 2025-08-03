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
const messageFile = "messages.json";
let messages = {};
function loadMessages() {
    if (!fs.existsSync(messageFile)) {
        fs.writeFileSync(messageFile, JSON.stringify({}));
    }
    let tmp = JSON.parse(fs.readFileSync(messageFile, "utf8"));
    for (const id of Object.keys(tmp)) {
        let message = tmp[id];
        messages[id] = [...emptyMsg, ...message];
    }
}
function saveMessages() {
    let tmp = {};
    for (const id of Object.keys(messages)) {
        let msg = [...messages[id]];
        msg.splice(0, 2);
        tmp[id] = msg;
    }
    fs.writeFileSync(messageFile, JSON.stringify(tmp));
}
function readSync(path) {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "");
        return "";
    }
    return fs.readFileSync(path, "utf-8");
}
let prompt = readSync("./prompt.txt");
// TODO 聊天相关性检测，在没有 AT 的情况下辨别是否在与bot聊天
let about = readSync("./about.txt");
let emptyMsg = [
    {
        role: "system",
        content: prompt
    }, {
        role: "assistant",
        content: "明白了喵！"
    }
];
let empAbout = [
    {
        role: "system",
        content: about
    }, {
        role: "assistant",
        content: "false"
    }
];
let groupMessages = {};
let groupCaches = {};
function addCache(id, message) {
    let arr = groupCaches[id] || [];
    arr.push(message);
    groupCaches[id] = arr;
}
function addGroupMessage(id, message, sender) {
    let msg = groupMessages[id] || emptyAbout();
    let data = {
        nickname: sender.nickname,
        user_id: sender.user_id,
        content: message,
        time: Date.now()
    };
    msg.push({
        role: "user",
        content: JSON.stringify(data),
    });
    groupCaches[id] = msg;
    return msg;
}
function emptyMessage() {
    return [...emptyMsg];
}
function emptyAbout() {
    return [...empAbout];
}
function getMessage(id) {
    return messages[id] || emptyMessage();
}
function setMessages(id, _messages) {
    messages[id] = _messages;
    saveMessages();
}
function addMessage(id, message) {
    let msg = getMessage(id);
    if (!message) {
        return msg;
    }
    msg.push({
        role: message.role,
        content: message.content
    });
    messages[id] = msg;
    saveMessages();
    return msg;
}
function clearMessage(id) {
    messages[id] = emptyMessage();
    saveMessages();
}
function sendMessage(messages) {
    return __awaiter(this, void 0, void 0, function* () {
        return openAi.chat.completions.create({
            model: "deepseek-chat",
            messages: messages,
            temperature: 1.7
        }).then(response => {
            return response.choices[0].message;
        }).catch(_ => {
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
            loadMessages();
            const sentences = /([^。?!？！]+[。?!？！\n\t]?)/ig;
            let lastMessage = -1;
            let lastSender = {};
            let typing = false;
            setInterval(() => {
                if (queue.length < 1 || typing)
                    return;
                let current = queue[0];
                let group = current.group_id;
                let last = lastSender[group] || -1;
                let messages = current.messages;
                if (messages.length < 1) {
                    queue.shift();
                    return;
                }
                let msg = messages.shift();
                let mb = new MessageBuilder_1.MessageBuilder();
                if (lastMessage != current.message_id || last != current.user_id) {
                    mb.reply(current.message_id);
                    lastSender[group] = current.user_id;
                }
                mb.append(msg);
                lastMessage = current.message_id;
                typing = true;
                setTimeout(() => {
                    this.client.sendGroupMessage(current.group_id, mb.build()).then(() => {
                        typing = false;
                    }).catch(e => {
                        this.logger.error("发送消息失败：", e);
                    });
                }, msg.length * 500);
            }, 100);
            this.client.on("group_message", (event) => __awaiter(this, void 0, void 0, function* () {
                lastSender[event.group_id] = event.user_id;
                let message = event.message;
                let cue = yield message.isCue(this.client.bot_id, this.client).catch(() => { return false; });
                if (!cue)
                    return;
                let sender = event.sender;
                let group = yield event.group.catch(() => { });
                if (!group)
                    return;
                let msg = event.message.toString(true);
                // 最大处理字数 300
                if (msg.length > 300) {
                    group.sendMessage(new MessageBuilder_1.MessageBuilder()
                        .at(sender.user_id)
                        .append(" 好多字... 咱看不过来了...")
                        .build()).catch(_ => { });
                    return;
                }
                let time = new Date();
                let formatted = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
                let content = `[${formatted}] ${msg.replace(`[@${event.self_id}]`, "")}`;
                this.logger.info(`[${group.group_name}] ${sender.nickname}: ${msg}`);
                // 停止传播事件
                event.stopPropagation();
                // 备份在 BREAK 前的消息记录
                let backup = [...getMessage(sender.user_id)];
                sendMessage(addMessage(sender.user_id, {
                    role: "user",
                    content: content
                })).then(message => {
                    if (!message)
                        return;
                    let content = message.content;
                    if (!content)
                        return;
                    addMessage(sender.user_id, message);
                    if (content.match("PASS")) {
                        setMessages(sender.user_id, backup);
                        return;
                    }
                    if (content.match("BREAK")) {
                        setMessages(sender.user_id, backup);
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
                        if (buf.length < 8) {
                            buf += msg.trim();
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
                        message_id: event.message_id
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
            }));
        }
    }
};
