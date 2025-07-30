import {Event} from "../Event";

export class NoticeEvent extends Event {
    readonly notice_type: string
    readonly sub_type: string

    constructor(payload: any) {
        super(payload)
        this.notice_type = payload.notice_type
        this.sub_type = payload.sub_type
    }
}