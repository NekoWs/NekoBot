import {AbstractPlugin} from "../src/nekobot/plugin/AbstractPlugin"
import { OpenAI } from "openai"
import * as fs from "node:fs";
import {ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";
import {MessageBuilder} from "../onebot/message/MessageBuilder";
import {Sender} from "../onebot/contact/Sender";

const openAi = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: fs.readFileSync("api-key.txt", "utf-8")
})

const messageFile = "messages.json"
let messages: any = {}

function loadMessages(): void {
    if (!fs.existsSync(messageFile)) {
        fs.writeFileSync(messageFile, JSON.stringify({}))
    }
    messages = JSON.parse(fs.readFileSync(messageFile, "utf8"));
}

function saveMessages(): void {
    fs.writeFileSync(messageFile, JSON.stringify(messages));
}

function readSync(path: string): string {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "")
        return ""
    }
    return fs.readFileSync(path, "utf-8")
}

let prompt = readSync("./prompt.txt")

// TODO 聊天相关性检测，在没有 AT 的情况下辨别是否在与bot聊天
let about = readSync("./about.txt")

let emptyMsg: ChatCompletionMessageParam[] = [
    {
        role: "system",
        content: prompt
    }, {
        role: "assistant",
        content: "明白了喵！"
    }
]

let empAbout: ChatCompletionMessageParam[] = [
    {
        role: "system",
        content: about
    }, {
        role: "assistant",
        content: "false"
    }
]

let groupMessages: any = {}
let groupCaches: any = {}

function addCache(id: number, message: any) {
    let arr: any[] = groupCaches[id] || []
    arr.push(message)
    groupCaches[id] = arr
}

function addGroupMessage(id: number, message: string, sender: Sender) {
    let msg: ChatCompletionMessageParam[] = groupMessages[id] || emptyAbout()
    let data = {
        nickname: sender.nickname,
        user_id: sender.user_id,
        content: message,
        time: Date.now()
    }
    msg.push({
        role: "user",
        content: JSON.stringify(data),
    })
    groupCaches[id] = msg
    return msg
}

function emptyMessage() {
    return [...emptyMsg]
}

function emptyAbout() {
    return [...empAbout]
}

function getMessage(id: number) {
    return messages[id] || emptyMessage()
}

function setMessages(id: number, _messages: any[]) {
    messages[id] = _messages
    saveMessages()
}

export function addMessage(id: number, message: ChatCompletionMessageParam | undefined) {
    let msg = getMessage(id)
    if (!message) {
        return msg
    }
    msg.push({
        role: message.role,
        content: message.content
    })
    messages[id] = msg
    saveMessages()
    return msg
}

export function clearMessage(id: number) {
    messages[id] = emptyMessage()
    saveMessages()
}

async function sendMessage(messages: ChatCompletionMessageParam[]) {
    return openAi.chat.completions.create({
        model: "deepseek-chat",
        messages: messages,
        temperature: 1.7
    }).then(response => {
        return response.choices[0].message
    }).catch(_ => {
        return null
    })
}

const queue: any[] = []

module.exports = {
    name: "MeowBot",
    description: "Meow meow...",
    plugin: class MeowPlugin extends AbstractPlugin {
        onEnable(): void {
            loadMessages()

            const sentences = /([^。?!？！]+[。?!？！\n\t]?)/ig
            let lastMessage = -1
            let lastSender = -1
            let typing = false

            setInterval(() => {
                if (queue.length < 1 || typing) return
                let current = queue[0]
                let messages = current.messages
                if (messages.length < 1) {
                    queue.shift()
                    return
                }
                let msg = messages.shift()
                let mb = new MessageBuilder()
                if (lastMessage != current.message_id || lastSender != current.user_id) {
                    mb.reply(current.message_id)
                    lastSender = current.user_id
                }
                mb.append(msg)
                lastMessage = current.message_id
                typing = true
                setTimeout(() => {
                    this.client.sendGroupMessage(current.group_id, mb.build()).then(() => {
                        typing = false
                    }).catch(e => {
                        this.logger.error("发送消息失败：", e)
                    })
                }, msg.length * 500)
            }, 100)

            this.client.on("group_message", async (event) => {
                lastSender = event.user_id

                let message = event.message
                let cue = await message.isCue(this.client.bot_id, this.client).catch(() => { return false })

                if (!cue) return
                let sender = event.sender
                let group = await event.group.catch(() => {})
                if (!group) return
                let msg = event.message.toString(true)
                // 最大处理字数 300
                if (msg.length > 300) {
                    group.sendMessage(
                        new MessageBuilder()
                            .at(sender.user_id)
                            .append(" 好多字... 咱看不过来了...")
                            .build()
                    ).catch(_ => {})
                    return
                }
                let time = new Date()
                let formatted = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`
                let content = `[${formatted}] ${msg.replace(`[@${event.self_id}]`, "")}`
                this.logger.info(`[${group.group_name}] ${sender.nickname}: ${msg}`)
                // 停止传播事件
                event.stopPropagation()
                // 备份在 BREAK 前的消息记录
                let backup = [...getMessage(sender.user_id)]
                sendMessage(addMessage(sender.user_id, {
                    role: "user",
                    content: content
                })).then(message => {
                    if (!message) return
                    let content = message.content
                    if (!content) return
                    addMessage(sender.user_id, message)
                    if (content.match("PASS")) return
                    if (content.match("BREAK")) {
                        setMessages(sender.user_id, backup)
                        let mb = new MessageBuilder()
                        mb.at(sender.user_id)
                            .append(" ")
                            .append("不想聊这个话题了喵！")
                        group.sendMessage(mb.build()).catch(e => {
                            this.logger.warn("发送消息失败：", e)
                        })
                        return
                    }

                    let messages = content.match(sentences) || []
                    let marge: string[] = []
                    let buf = ""
                    // 合并短消息，比如 “喵？” 不应该单独发送
                    messages.forEach(msg => {
                        if (buf.length < 8) {
                            buf += msg.trim()
                            return
                        }
                        marge.push(buf)
                        buf = msg
                    })
                    marge.push(buf)
                    // 将消息添加进队列
                    queue.push({
                        messages: marge,
                        group_id: event.group_id,
                        user_id: sender.user_id,
                        message_id: event.message_id
                    })
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
                    this.logger.warn("发送消息失败：", e)
                })
            })
        }
    }
}