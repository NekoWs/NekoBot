import {NoticeEvent} from "./NoticeEvent";

export class ProfileLikeEvent extends NoticeEvent {
    /**
     * 点赞的用户 QQ 号
     */
    readonly operator_id: number

    /**
     * 点赞的用户的昵称
     */
    readonly operator_nick: string

    /**
     * 点赞次数
     */
    readonly times: number

    constructor(payload: any) {
        super(payload)
        this.operator_id = payload.operator_id
        this.operator_nick = payload.operator_nick
        this.times = payload.times
    }
}