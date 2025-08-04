import {NoticeEvent} from "./NoticeEvent";

export class GroupNoticeEvent extends NoticeEvent{
    /**
     * 群号
     */
    readonly group_id: number

    constructor(payload: any) {
        super(payload)
        this.group_id = payload.group_id
    }
}