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
    let response = await openAi.chat.completions.create({
        model: "deepseek-chat",
        messages: messages,
        temperature: 1.5
    })
    return response.choices[0].message
}

module.exports = {
    name: "MeowBot",
    description: "Meow meow...",
    plugin: class MeowPlugin extends AbstractPlugin {
        onEnable(): void {
            const sentences = /([^。?!？！]+[。?!？！]?)/ig

            this.client.on("group_message", (event) => {
                let message = event.message
                message.isCue(this.client.bot_id, this.client).then(cue => {
                    if (!cue) return

                    event.stopPropagation()

                    let sender = event.sender
                    event.getGroup().then(group => {
                        if (!group) return

                        let msg = `${sender.nickname}(${sender.user_id}): ${event.message.toString(true)}`

                        this.logger.info(`[${group.group_name}] ${sender.nickname}: ${msg}`)

                        sendMessage(addMessage(sender.user_id, {
                            role: "user",
                            content: msg
                        })).then(message => {
                            let content = message.content
                            if (!content) return
                            this.logger.info("Response:", content)
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
                            let delay = 0
                            for (const msg of marge) {
                                setTimeout(() => {
                                    void group.sendMessage(msg).catch(e => {
                                        this.logger.warn("发送消息失败：", e)
                                    })
                                }, delay)
                                delay += Math.floor(Math.random() * 2000) + 1000
                            }
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