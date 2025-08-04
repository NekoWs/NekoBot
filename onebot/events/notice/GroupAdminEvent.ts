import {GroupNoticeEvent} from "./GroupNoticeEvent";

export class GroupAdminEvent extends GroupNoticeEvent {
    /**
     * 被修改管理员的 QQ 号
     */
    readonly user_id: number

    constructor(payload: any) {
        super(payload)
        this.user_id = payload.user_id
    }
}