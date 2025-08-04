import {GroupNoticeEvent} from "./GroupNoticeEvent";

export class EssenceEvent extends GroupNoticeEvent {
    /**
     * 暂不明确，似乎与 `sender_id` 一致
     */
    readonly user_id: number

    /**
     * 被设精的消息 ID
     */
    readonly message_id: number

    /**
     * 被设精的消息发送者
     */
    readonly sender_id: number

    /**
     * 设精操作者 QQ 号
     */
    readonly operator_id: number

    constructor(payload: any) {
        super(payload)
        this.user_id = payload.user_id
        this.message_id = payload.message_id
        this.sender_id = payload.sender_id
        this.operator_id = payload.operator_id
    }
}