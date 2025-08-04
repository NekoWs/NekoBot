import {NoticeEvent} from "./NoticeEvent";

export class FriendRecallEvent extends NoticeEvent {
    /**
     * 被撤回的消息 ID
     */
    readonly message_id: number

    /**
     * 撤回者的 QQ 号
     */
    readonly user_id: number

    constructor(payload: any) {
        super(payload)
        this.message_id = payload.message_id
        this.user_id = payload.user_id
    }
}