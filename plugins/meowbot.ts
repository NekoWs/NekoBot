import {AbstractPlugin} from "../src/nekobot/plugin/AbstractPlugin"
import { OpenAI } from "openai"
import * as fs from "node:fs";
import {ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";
import {MessageBuilder} from "../onebot/message/MessageBuilder";

const openAi = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: fs.readFileSync("api-key.txt", "utf-8")
})
let messages: any = {}

let prompt = fs.readFileSync("./prompt.txt", "utf8")
let emptyMsg: ChatCompletionMessageParam[] = [
    {
        role: "system",
        content: prompt
    }, {
        role: "assistant",
        content: "明白了喵！"
    }
]

function emptyMessage() {
    return [...emptyMsg]
}

function getMessage(id: number) {
    return messages[id] || emptyMessage()
}

export function addMessage(id: number, message: ChatCompletionMessageParam | undefined) {
    let msg = getMessage(id)
    if (!message) {
        return msg
    }
    msg.push({
        role: message.role,
        content: message.content,
    })
    messages[id] = msg
    return msg
}

export function clearMessage(id: number) {
    messages[id] = emptyMessage()
}

async function sendMessage(messages: ChatCompletionMessageParam[]) {
    return openAi.chat.completions.create({
        model: "deepseek-chat",
        messages: messages,
        temperature: 1.5
    }).then(response => {
        return response.choices[0].message
    }).catch(e => {
        return null
    })
}

const queue: any[] = []

module.exports = {
    name: "MeowBot",
    description: "Meow meow...",
    plugin: class MeowPlugin extends AbstractPlugin {
        onEnable(): void {
            const sentences = /([^。?!？！]+[。?!？！]?)/ig
            let lastMessage = -1
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
                if (lastMessage != current.message_id) {
                    mb.reply(current.message_id)
                }
                mb.append(msg)
                lastMessage = current.message_id
                typing = true
                setTimeout(() => {
                    this.client.sendGroupMessage(current.group_id, mb.build()).catch(e => {
                        this.logger.error("发送消息失败：", e)
                    })
                    typing = false
                }, msg.length * 300)
            }, 100)

            this.client.on("group_message", (event) => {
                let message = event.message
                message.isCue(this.client.bot_id, this.client).then(cue => {
                    if (!cue) return
                    let sender = event.sender
                    event.getGroup().then(group => {
                        if (!group) return
                        let msg = `${sender.nickname}(${sender.user_id}): ${event.message.toString(true)}`
                        // 最大处理字数 300
                        if (msg.length > 300) {
                            group.sendMessage(
                                new MessageBuilder()
                                    .at(sender.user_id)
                                    .append(" 好多字... 咱看不过来了...")
                                    .build()
                            ).catch(e => {})
                            return
                        }
                        this.logger.info(`[${group.group_name}] ${msg}`)
                        // 停止传播事件
                        event.stopPropagation()
                        sendMessage(addMessage(sender.user_id, {
                            role: "user",
                            content: msg.replace(`[@${event.self_id}]`, "")
                        })).then(message => {
                            if (!message) return
                            let content = message.content
                            if (!content) return
                            addMessage(sender.user_id, message)
                            if (content.match("BREAK")) {
                                clearMessage(sender.user_id)
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
                                if (buf.length < 5) {
                                    buf += msg
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
                                message: event.message_id
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
                    }).catch(e => {
                        this.logger.warn("获取群信息失败：", e)
                    })
                }).catch(e => {
                    this.logger.warn("获取相关性失败：", e)
                })
            })
        }
    }
}