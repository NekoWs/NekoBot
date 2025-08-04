import {GroupNoticeEvent} from "./GroupNoticeEvent";

export class GroupRecallEvent extends GroupNoticeEvent {
    /**
     * 被撤回的消息 ID
     */
    readonly message_id: number

    /**
     * 被撤回的消息的发送者
     */
    readonly user_id: number

    /**
     * 撤回者 ID
     */
    readonly operator_id: number

    constructor(payload: any) {
        super(payload)
        this.message_id = payload.message_id
        this.user_id = payload.user_id
        this.operator_id = payload.operator_id
    }
}