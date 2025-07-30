import {Event} from "./Event";
import {MessageChain} from "../message/MessageChain";
import {Sender} from "../contact/Sender";

export class MessageEvent extends Event {
    /**
     * 消息类型，群聊为 'group' 私聊为 ‘private'
     */
    readonly message_type: string
    /**
     * 子类型，尚不明确
     * 目前已知群聊时通常为 'normal'，私聊时为 'private'，好友为 'friend'
     */
    readonly sub_type: string
    /**
     * 消息 ID，可用于很多用处，例如 撤回、回复
     * 还可用于获取消息详细信息，详见 OneBot: 'get_msg'
     */
    readonly message_id: number
    /**
     * 用户 ID，通常为发送者的 QQ
     */
    readonly user_id: number
    /**
     * 接收到的消息
     */
    readonly message: MessageChain
    /**
     * 原消息格式
     */
    readonly raw_message: string
    /**
     * 消息字体
     */
    readonly font: number
    /**
     * 消息的发送者对象
     */
    readonly sender: Sender

    /**
     * 消息事件
     * @param payload 原数据
     */
    constructor(payload: any) {
        super(payload)
        this.message_type = payload.message_type
        this.sub_type = payload.sub_type || "native"
        this.message_id = payload.message_id
        this.message = new MessageChain(payload.message)
        this.raw_message = payload.raw_message
        this.font = payload.font
        this.sender = new Sender(payload.sender)
        this.user_id = payload.user_id || this.sender.user_id
    }
}