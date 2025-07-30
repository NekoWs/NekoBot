import {Message, MessageTypeMap} from "./Message";
import {Client} from "../OneBot";

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

    async isCue(id: number, client: Client): Promise<boolean> {
        for (let msg of this.chain) {
            if (msg.type === "at") {
                if (msg.data.qq == id) {
                    return true
                }
            } else if (msg.type === "reply") {
                try {
                    client.getMsg(msg.data.id).then(msg => {
                        if (msg.sender.user_id == id) {
                            return true
                        }
                    }).catch(() => {})
                } catch (e) { }
            }
        }
        return false
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
}