import {AbstractPlugin} from "../src/nekobot/plugin/AbstractPlugin"
import {OpenAI} from "openai"
import * as fs from "node:fs";
import {ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";
import {MessageBuilder} from "../onebot/message/MessageBuilder";
import {Sender} from "../onebot/contact/Sender";
import {MessageChain} from "../onebot/message/MessageChain";
import {Client} from "../onebot/OneBot";
import {Group} from "../onebot/contact/Group";
import { Logger } from "../src/nekobot/utils/Logger";

const openAi = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: fs.readFileSync("api-key.txt", "utf-8")
})
const admin = 1689295608
const messageFile = "messages.json"
let messages: any = {}

function loadMessages(): void {
    if (!fs.existsSync(messageFile)) {
        fs.writeFileSync(messageFile, JSON.stringify({}))
    }
    let tmp = JSON.parse(fs.readFileSync(messageFile, "utf8"))
    for (const id of Object.keys(tmp)) {
        let message: ChatCompletionMessageParam[] = tmp[id]

        messages[id] = [...emptyMsg, ...message]
    }
}

function saveMessages(): void {
    let tmp: any = {}
    for (const id of Object.keys(messages)) {
        let msg: ChatCompletionMessageParam[] = [...messages[id]]
        msg.splice(0, 2)
        tmp[id] = msg
    }
    fs.writeFileSync(messageFile, JSON.stringify(tmp))
}

function readSync(path: string): string {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "")
        return ""
    }
    return fs.readFileSync(path, "utf-8")
}

let prompt = readSync("./prompt.txt").replaceAll("\n", "")

// TODO 聊天相关性检测，在没有 AT 的情况下辨别是否在与bot聊天
let about = readSync("./about.txt")

let breakPrompt = readSync("./break.txt")

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
let groupLastCue: any = {}

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

function getMessage(id: number): any[] {
    return messages[id] || emptyMessage()
}

function setMessages(id: number, _messages: any[]) {
    messages[id] = _messages
    saveMessages()
}

function addMessage(id: number, message: ChatCompletionMessageParam | undefined) {
    let msg = getMessage(id)
    if (!message) {
        return msg
    }
    // 将记忆控制在 200 条以减少成本
    if (msg.length > 200) {
        msg.splice(0, msg.length - 200)
    }
    msg.push({
        role: message.role,
        content: message.content
    })
    messages[id] = msg
    saveMessages()
    return msg
}

async function requestChat(messages: ChatCompletionMessageParam[], temperature: number = 1.2) {
    return openAi.chat.completions.create({
        model: "deepseek-chat",
        messages: messages,
        temperature: temperature
    }).then(response => {
        return response.choices[0].message
    }).catch(e => {
        sendError(e)
        return null
    })
}

const sentences = /([^。?!？！]+[。?!？！\n\t]?)/ig
const queue: any[] = []

let logger: Logger

function sendError(err: any) {
    logger.error(err)
}

function toXX(num: number) {
    if (num > 9) return String(num)
    return `0${num}`
}

async function requestBreak() {
    return requestChat([
        ...emptyMsg, {
            role: "system",
            content: breakPrompt
        }
    ], 1.5)  // 使 BREAK 回复更多随机性
}

async function sendMessage(
    group: Group,
    user_id: number,
    message: string,
    message_id: number,
    bot_id: number,
    ignore_break: boolean = false,
    at: boolean = false
) {
    // 最大处理字数 300
    if (message.length > 300) {
        group.sendMessage(
            new MessageBuilder()
                .at(user_id)
                .append(" 好多字... 咱看不过来了...")
                .build()
        ).catch(sendError)
        return
    }
    let time = new Date()
    let formatted = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${toXX(time.getHours())}:${toXX(time.getMinutes())}:${toXX(time.getSeconds())}`
    message = message.replaceAll(`[@${bot_id}]`, "").trim()

    let content = `[${formatted}] ${message}`
    let member = await group.getMember(user_id).catch(sendError)
    if (!member) return
    logger.info(`${member.nickname}: ${content}`)

    // 备份在 BREAK 前的消息记录
    let backup = [...getMessage(user_id)]
    requestChat(addMessage(
        user_id, {
            role: "user",
            content: content
        }
    )).then(message => {
        if (!message) return
        let content = message.content?.replaceAll("\n", "")
        if (!content) return
        addMessage(user_id, message)
        if (content.match("PASS")) {
            setMessages(user_id, backup)
            return
        }
        if (content.match("BREAK")) {
            setMessages(user_id, backup)
            if (ignore_break) return

            requestBreak().then(message => {
                if (!message) return
                // 将获取到的 BREAK 响应添加到回复队列
                queue.push({
                    messages: [message.content],
                    group_id: group.group_id,
                    user_id: user_id,
                    message_id: message_id,
                    at: at
                })
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
            group_id: group.group_id,
            user_id: user_id,
            message_id: message_id,
            at: at
        })
    }).catch(sendError)
}

/**
 * 是否提及指定 QQ
 *
 * @param chain 消息链
 * @param id QQ
 * @param client 客户端
 */
async function isCue(chain: MessageChain, id: number, client: Client): Promise<boolean> {
    for (let msg of chain.chain) {
        if (msg.type === "at") {
            if (msg.data.qq == id) {
                return true
            }
        } else if (msg.type === "reply") {
            try {
                let reply = await client.getMsg(msg.data.id).catch(sendError)
                if (!reply) continue
                if (reply.sender.user_id == id) {
                    return true
                }
            } catch (e) { }
        }
    }
    return false
}

module.exports = {
    name: "MeowBot",
    description: "Meow meow...",
    plugin: class MeowPlugin extends AbstractPlugin {
        onEnable(): void {
            logger = this.logger

            loadMessages()

            let lastMessage = -1
            let lastSender: any = {}
            let typing = false

            setInterval(() => {
                if (queue.length < 1 || typing) return
                let current = queue[0]
                if (!current) return

                let group = current.group_id
                let last = lastSender[group] || -1
                let messages = current.messages
                if (messages.length < 1) {
                    queue.shift()
                    return
                }
                let msg = messages.shift()
                let mb = new MessageBuilder()
                if (lastMessage != current.message_id || last != current.user_id) {
                    mb.reply(current.message_id)
                    lastSender[group] = current.user_id
                }
                if (current.at) {
                    mb.at(current.user_id)
                }
                mb.append(msg)
                lastMessage = current.message_id
                typing = true
                setTimeout(() => {
                    this.client.sendGroupMessage(current.group_id, mb.build()).catch(e => {
                        this.logger.error("发送消息失败：", e)
                    }).finally(() => {
                        typing = false
                    })
                }, msg.length * 200)
            }, 100)

            this.client.on("group_message", async (event) => {
                let message = event.message
                let sender = event.sender

                lastSender[event.group_id] = sender.user_id
                let group = await event.group.catch(sendError)
                if (!group) return

                // 暂时用于清空聊天记录
                if (sender.user_id == admin) {
                    let msg = message.toString().trim()
                    if (msg.startsWith("DELETE")) {
                        let uid = msg.substring(7)
                        group.sendMessage("DELETED").catch(sendError)
                        setMessages(Number(uid), [])
                        return
                    }
                }

                let cue = await isCue(message, this.client.bot_id, this.client).catch(() => { return false })
                if (!cue) return

                await sendMessage(
                    group,
                    sender.user_id,
                    message.toString(),
                    event.message_id,
                    event.self_id
                )
                // 停止传播事件
                event.stopPropagation()
            })
        }
    }
}