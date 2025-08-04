import {NoticeEvent} from "./NoticeEvent";

export class FriendAddEvent extends NoticeEvent {
    /**
     * 添加的好友 QQ 号
     */
    readonly user_id: number

    constructor(payload: any) {
        super(payload)
        this.user_id = payload.user_id
    }
}