import {AbstractPlugin} from "../src/nekobot/plugin/AbstractPlugin"
import {OpenAI} from "openai"
import * as fs from "node:fs";
import {
    ChatCompletionMessage,
    ChatCompletionMessageParam,
    ChatCompletionMessageToolCall
} from "openai/resources/chat/completions/completions";
import {MessageBuilder} from "../onebot/message/MessageBuilder";
import {MessageChain} from "../onebot/message/MessageChain";
import {Client} from "../onebot/OneBot";
import {Group} from "../onebot/contact/Group";
import { Logger } from "../src/nekobot/utils/Logger";
import {DateFormatter} from "../src/nekobot/utils/DateFormatter";
import pangu from "pangu";

const openAi = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: fs.readFileSync("api-key.txt", "utf-8")
})
const admin = 1689295608
const messageFile = "messages.json"
const maxCount = 100

const lastReply: any = {}
const lastSender: any = {}
const messages: any = {}

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "get_time",
            description: "获取当前时间",
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
]

function getTypingDelay(msg: string): number {
    return msg.length * 200
}

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
        msg.splice(0, emptyMsg.length)
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

const prompt = readSync("./prompt.txt").replaceAll(/[\n\r]/g, "")

let emptyMsg: ChatCompletionMessageParam[] = [
    {
        role: "system",
        content: prompt
    }
]

function emptyMessage() {
    return [...emptyMsg]
}

function getMessage(id: number): any[] {
    return messages[id] || emptyMessage()
}

function setMessages(id: number, _messages: any[]) {
    messages[id] = _messages
    saveMessages()
}

function addMessage(id: number, message: ChatCompletionMessageParam | ChatCompletionMessage | undefined) {
    let msg: any[] = getMessage(id)
    if (!message) {
        return msg
    }
    // 将记忆控制在 100 条以减少成本
    if (msg.length > maxCount) {
        msg.splice(emptyMsg.length, msg.length - maxCount)
    }
    msg.push(message)

    messages[id] = msg
    saveMessages()
    return msg
}

async function requestChat(
    messages: ChatCompletionMessageParam[],
    temperature: number = 1.5
): Promise<ChatCompletionMessage | null> {
    return openAi.chat.completions.create({
        model: "deepseek-chat",
        messages: messages,
        temperature: temperature,
        tools: tools
    }).then(async response => {
        let msg = response.choices[0].message
        let calls = msg.tool_calls
        if (calls && calls.length > 0) {
            let toolMessages = toolsCallback(calls)
            let tmp = [...messages]
            tmp.push(msg)
            for (const msg of toolMessages) {
                tmp.push(msg)
            }
            return requestChat(tmp, temperature)
        }
        return msg
    }).catch(e => {
        sendError(e)
        return null
    })
}

function toolsCallback(calls: ChatCompletionMessageToolCall[]): ChatCompletionMessageParam[] {
    let results: ChatCompletionMessageParam[] = []
    for (const call of calls) {
        let func = call.function
        let args: any = {}
        try {
            args = JSON.parse(func.arguments)
        } catch (e) {}
        switch (func.name) {
            case "get_time":
                results.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: DateFormatter.format(new Date(), args["pattern"])
                })
                break
        }
    }
    return results
}

const queue: any[] = []

let logger: Logger

function sendError(err: any) {
    if (err instanceof Error) {
        logger.error(err.stack || err)
    }
}

async function sendMessage(
    group: Group,
    user_id: number,
    message: string,
    message_id: number,
    ignore_pass: boolean = false,
    at: boolean = false
) {
    // 最大处理字数 100
    if (message.length > 100 || message.length < 1) return

    let member = await group.getMember(user_id).catch(sendError)
    if (!member) return
    logger.info(`${member.nickname}: ${message}`)

    // 备份在 BREAK 前的消息记录
    let backup = [...getMessage(user_id)]

    requestChat(
        addMessage(user_id, {
            role: "user",
            content: message
        })
    ).then(message => {
        if (!message) return

        let content = message.content
        if (!content) return
        addMessage(user_id, message)

        if (content.match("PASS")) {
            if (ignore_pass) return
            let replace = content.replaceAll("PASS", "").trim() || "……"
            if (!replace) return

            queue.push({
                messages: [replace],
                group_id: group.group_id,
                user_id: user_id,
                message_id: message_id,
                at: at
            })
            return
        }
        if (content.match("BREAK")) {
            setMessages(user_id, backup)
            return
        }

        let messages = content.split("\n") || []
        if (messages.length > 2) {
            messages = [content.replaceAll("\n", "").trim()]
        }
        let cleared: string[] = []
        messages.forEach(message => {
            let trim = message.trim().replace(/[\n\r\t]/g, "")
            if (trim.endsWith("。")) {
                trim = trim.substring(0, trim.length - 1)
            }
            if (trim) {
                // 使用 pangu.js 添加空格
                cleared.push(pangu.spacingText(trim))
            }
        })
        // let marge: string[] = []
        // let buf = ""
        // // 合并短消息，比如 “喵？” 不应该单独发送
        // messages.forEach(msg => {
        //     if (buf.length < 8) {
        //         buf += msg.trim().replace(/[\n\r\t]/g, "")
        //         return
        //     }
        //     if (buf.endsWith("。")) {
        //         buf = buf.substring(0, buf.length - 1)
        //     }
        //     marge.push(buf)
        //     buf = msg
        // })
        // marge.push(buf)

        queue.push({
            messages: cleared,
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
 * @param sender 发送者QQ
 * @param group 消息群
 * @param client 客户端
 */
async function isCue(
    chain: MessageChain,
    id: number,
    sender: number,
    group: number,
    client: Client
): Promise<boolean> {
    let flag = false
    let now = Date.now()
    if (now - (lastReply[sender] || 0) < 30 * 1000 || lastSender[group] == id) {
        flag = true
    }

    for (let msg of chain.chain) {
        if (msg.type === "at") {
            if (msg.data.qq == id) {
                return true
            }
            flag = false
        } else if (msg.type === "reply") {
            try {
                let reply = await client.getMsg(msg.data.id).catch(sendError)
                if (!reply) continue

                return reply.sender.user_id == id
            } catch (e) { }
        }
    }
    return flag
}

module.exports = {
    name: "Thyme",
    description: "Meow meow...",
    plugin: class MeowPlugin extends AbstractPlugin {
        onEnable(): void {
            logger = this.logger

            loadMessages()

            let lastMessage = -1
            let typing = false

            setInterval(() => {
                if (queue.length < 1 || typing) return
                let current = queue[0]
                if (!current) return

                let group = current.group_id
                let last = lastSender[group] || -1
                let messages: string[] = current.messages
                if (messages.length < 1) {
                    queue.shift()
                    return
                }
                // 移除首个消息
                let msg: string = messages.shift()!!
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
                        logger.error("发送消息失败：", e)
                    }).finally(() => {
                        lastReply[current.user_id] = Date.now()
                        typing = false
                    })
                }, getTypingDelay(msg))
            }, 100)

            this.client.on("group_message", async (event) => {
                let message = event.message
                let sender = event.sender

                if (!sender) return

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

                let cue = await isCue(
                    message,
                    this.client.bot_id,
                    sender.user_id,
                    event.group_id,
                    this.client
                ).catch(() => { return false })

                if (!cue) return

                await sendMessage(
                    group,
                    sender.user_id,
                    message.toStringOnly(),
                    event.message_id
                )
                // 停止传播事件
                event.stopPropagation()
            })
        }
    }
}