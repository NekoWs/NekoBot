import {GroupNoticeEvent} from "./GroupNoticeEvent";

export class GroupNameEvent extends GroupNoticeEvent {
    /**
     * 修改者的 QQ 号
     */
    readonly user_id: number

    /**
     * 新群名
     */
    readonly name_new: string

    constructor(payload: any) {
        super(payload)
        this.user_id = payload.user_id
        this.name_new = payload.name_new
    }
}