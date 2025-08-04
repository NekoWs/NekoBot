import {Event} from "../Event";

export class NoticeEvent extends Event {
    /**
     * 提示类型
     */
    readonly notice_type: string

    /**
     * 子类型
     */
    readonly sub_type: string

    constructor(payload: any) {
        super(payload)
        this.notice_type = payload.notice_type
        this.sub_type = payload.sub_type
    }
}