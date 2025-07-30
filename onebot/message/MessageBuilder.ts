import {MessageChain} from "./MessageChain"
import {At} from "./messages/At"
import {Reply} from "./messages/Reply"
import {Face} from "./messages/Face"
import {Text} from "./messages/Text"
import {Message} from "./Message"

/**
 * 消息构造器
 */
export class MessageBuilder {
    private readonly chain: MessageChain = new MessageChain()
    get size(): number {
        return this.chain.size
    }

    /**
     * 追加 AT 消息
     *
     * @param user_id QQ
     */
    at(user_id: number): MessageBuilder {
        return this.append(new At(user_id))
    }

    /**
     * 追加回复消息
     *
     * @param message_id 消息ID
     */
    reply(message_id: number): MessageBuilder {
        return this.append(new Reply(message_id))
    }

    /**
     * 追加表情消息
     *
     * @param face_id 表情ID
     */
    face(face_id: number): MessageBuilder {
        return this.append(new Face(face_id))
    }

    /**
     * 追加消息，如果类型为 string 则添加文本消息
     *
     * @param message 消息
     */
    append(message: Message | string): MessageBuilder {
        let msg: Message
        if (message instanceof Message) {
            msg = message
        } else {
            msg = new Text(message)
        }
        this.chain.chain.push(msg)
        return this
    }

    /**
     * 构造消息链
     */
    build(): MessageChain {
        return this.chain
    }
}