import {NoticeEvent} from "./NoticeEvent";

export class GroupBanEvent extends NoticeEvent {
    /**
     * 群号
     */
    readonly group_id: number

    /**
     * 被禁言的用户 ID
     */
    readonly user_id: number

    /**
     * 操作者 ID
     */
    readonly operator_id: number

    /**
     * 禁言的时长，单位：秒
     */
    readonly duration: number
    constructor(payload: any) {
        super(payload)
        this.group_id = payload.group_id
        this.user_id = payload.user_id
        this.operator_id = payload.operator_id
        this.duration = payload.duration
    }
}