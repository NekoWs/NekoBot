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
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractPlugin_1 = require("../src/nekobot/plugin/AbstractPlugin");
const openai_1 = require("openai");
const fs = __importStar(require("node:fs"));
const MessageBuilder_1 = require("../onebot/message/MessageBuilder");
const DateFormatter_1 = require("../src/nekobot/utils/DateFormatter");
const openAi = new openai_1.OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: fs.readFileSync("api-key.txt", "utf-8")
});
const admin = 1689295608;
const messageFile = "messages.json";
const maxCount = 100;
const lastReply = {};
const messages = {};
const tools = [
    {
        type: "function",
        function: {
            name: "get_nickname",
            description: "获取用户。",
            parameters: {
                type: "object",
                properties: {
                    pattern: {
                        type: "string",
                        description: "获取时间的格式，例如 \"yyyy-MM-dd HH:mm:ss\"",
                    }
                },
                required: ["pattern"]
            }
        }
    }
];
function getTypingDelay(msg) {
    return msg.length * 200;
}
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
        msg.splice(0, emptyMsg.length);
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
const prompt = readSync("./prompt.txt").replaceAll(/[\n\r]/g, "");
let emptyMsg = [
    {
        role: "system",
        content: prompt
    }
];
function emptyMessage() {
    return [...emptyMsg];
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
    // 将记忆控制在 100 条以减少成本
    if (msg.length > maxCount) {
        msg.splice(emptyMsg.length, msg.length - maxCount);
    }
    msg.push(message);
    messages[id] = msg;
    saveMessages();
    return msg;
}
async function requestChat(messages, temperature = 1.2) {
    return openAi.chat.completions.create({
        model: "deepseek-chat",
        messages: messages,
        temperature: temperature,
        tools: tools
    }).then(async (response) => {
        let msg = response.choices[0].message;
        let calls = msg.tool_calls;
        if (calls && calls.length > 0) {
            let toolMessages = toolsCallback(calls);
            let tmp = [...messages];
            tmp.push(msg);
            for (const msg of toolMessages) {
                tmp.push(msg);
            }
            return requestChat(tmp, temperature);
        }
        return msg;
    }).catch(e => {
        sendError(e);
        return null;
    });
}
function toolsCallback(calls) {
    let results = [];
    for (const call of calls) {
        let func = call.function;
        let args = {};
        try {
            args = JSON.parse(func.arguments);
        }
        catch (e) { }
        switch (func.name) {
            case "get_time":
                results.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: DateFormatter_1.DateFormatter.format(new Date(), args["pattern"])
                });
                break;
        }
    }
    return results;
}
const sentences = /([^。?!？！]+[。?!？！\r\n\t]?)/ig;
const queue = [];
let logger;
function sendError(err) {
    if (err instanceof Error) {
        logger.error(err.stack || err);
    }
}
async function sendMessage(group, user_id, message, message_id, ignore_pass = false, at = false) {
    // 最大处理字数 100
    if (message.length > 100 || message.length < 1)
        return;
    let member = await group.getMember(user_id).catch(sendError);
    if (!member)
        return;
    logger.info(`${member.nickname}: ${message}`);
    // 备份在 BREAK 前的消息记录
    let backup = [...getMessage(user_id)];
    requestChat(addMessage(user_id, {
        role: "user",
        content: message
    })).then(message => {
        if (!message)
            return;
        let content = message.content?.replaceAll("\n", "");
        if (!content)
            return;
        addMessage(user_id, message);
        if (content.match("PASS")) {
            if (ignore_pass)
                return;
            let replace = content.replaceAll("PASS", "").trim() || "...";
            if (!replace)
                return;
            queue.push({
                messages: [replace],
                group_id: group.group_id,
                user_id: user_id,
                message_id: message_id,
                at: at
            });
            return;
        }
        if (content.match("BREAK")) {
            setMessages(user_id, backup);
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
        queue.push({
            messages: marge,
            group_id: group.group_id,
            user_id: user_id,
            message_id: message_id,
            at: at
        });
    }).catch(sendError);
}
/**
 * 是否提及指定 QQ
 *
 * @param chain 消息链
 * @param id QQ
 * @param sender 发送者QQ
 * @param client 客户端
 */
async function isCue(chain, id, sender, client) {
    let flag = false;
    let now = Date.now();
    if (now - (lastReply[sender] || 0) < 30 * 1000) {
        flag = true;
    }
    for (let msg of chain.chain) {
        if (msg.type === "at") {
            if (msg.data.qq == id) {
                return true;
            }
        }
        else if (msg.type === "reply") {
            try {
                let reply = await client.getMsg(msg.data.id).catch(sendError);
                if (!reply)
                    continue;
                return reply.sender.user_id == id;
            }
            catch (e) { }
        }
    }
    return flag;
}
module.exports = {
    name: "Thyme",
    description: "Meow meow...",
    plugin: class MeowPlugin extends AbstractPlugin_1.AbstractPlugin {
        onEnable() {
            logger = this.logger;
            loadMessages();
            let lastMessage = -1;
            let lastSender = {};
            let typing = false;
            setInterval(() => {
                if (queue.length < 1 || typing)
                    return;
                let current = queue[0];
                if (!current)
                    return;
                let group = current.group_id;
                let last = lastSender[group] || -1;
                let messages = current.messages;
                if (messages.length < 1) {
                    queue.shift();
                    return;
                }
                // 移除首个消息
                let msg = messages.shift();
                let mb = new MessageBuilder_1.MessageBuilder();
                if (lastMessage != current.message_id || last != current.user_id) {
                    mb.reply(current.message_id);
                    lastSender[group] = current.user_id;
                }
                if (current.at) {
                    mb.at(current.user_id);
                }
                mb.append(msg);
                lastMessage = current.message_id;
                typing = true;
                setTimeout(() => {
                    this.client.sendGroupMessage(current.group_id, mb.build()).catch(e => {
                        logger.error("发送消息失败：", e);
                    }).finally(() => {
                        lastReply[current.user_id] = Date.now();
                        typing = false;
                    });
                }, getTypingDelay(msg));
            }, 100);
            this.client.on("group_message", async (event) => {
                let message = event.message;
                let sender = event.sender;
                if (!sender)
                    return;
                lastSender[event.group_id] = sender.user_id;
                let group = await event.group.catch(sendError);
                if (!group)
                    return;
                // 暂时用于清空聊天记录
                if (sender.user_id == admin) {
                    let msg = message.toString().trim();
                    if (msg.startsWith("DELETE")) {
                        let uid = msg.substring(7);
                        group.sendMessage("DELETED").catch(sendError);
                        setMessages(Number(uid), []);
                        return;
                    }
                }
                let cue = await isCue(message, this.client.bot_id, sender.user_id, this.client).catch(() => { return false; });
                if (!cue)
                    return;
                await sendMessage(group, sender.user_id, message.toStringOnly(), event.message_id);
                // 停止传播事件
                event.stopPropagation();
            });
        }
    }
};
