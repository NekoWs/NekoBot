import {GroupNoticeEvent} from "./GroupNoticeEvent";

export class GroupTitleEvent extends GroupNoticeEvent {
    /**
     * 获得头衔的 QQ 号
     */
    readonly user_id: number

    /**
     * 获得的头衔
     */
    readonly title: string

    constructor(payload: any) {
        super(payload)
        this.user_id = payload.user_id
        this.title = payload.title
    }
}