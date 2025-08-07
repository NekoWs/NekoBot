import {Message, MessageTypeMap} from "./Message";
import {Client} from "../OneBot";
import * as repl from "node:repl";

/**
 * 消息链
 */
export class MessageChain {
    chain: Message[] = []
    constructor(payload: any = []) {
        for (let msg of payload) {
            this.chain.push(new Message(msg))
        }
    }

    /**
     * 获取消息链长度
     */
    get size(): number {
        return this.chain.length
    }

    /**
     * 将消息链转换为 JSON 格式
     */
    toJson(): object[] {
        let result: object[] = []
        this.chain.forEach(msg => {
            result.push(msg.toJson())
        })
        return result
    }

    /**
     * 将消息链转换为文本格式
     *
     * @param normal 是否文本化
     */
    toString(normal: boolean = true): string {
        let result = ""
        for (let msg of this.chain) {
            if (msg.type === "text") {
                result += msg.data.text
                continue
            }
            if (normal) {
                result += "[" + MessageTypeMap[msg.type]
                if (msg.type === "at") {
                    result += msg.data.qq
                }
                result += "]"
            } else {
                result +=
                    `[ONEBOT:${msg.type}:`+
                    `${JSON.stringify(msg.data)
                        .replace(":", "\\:")
                    }]`
            }
        }
        return result
    }

    /**
     * 将消息链转换为纯文本
     */
    toStringOnly(): string {
        let result = ""
        for (let msg of this.chain) {
            if (msg.type === "text") {
                result += msg.data.text
            }
        }
        return result
    }
}