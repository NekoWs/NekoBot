import {NoticeEvent} from "./NoticeEvent";

export class InputStatusEvent extends NoticeEvent {
    /**
     * 用户 ID
     */
    readonly user_id: number

    /**
     * 状态文本，例如 '对方正在输入...'
     */
    readonly status_text: string

    /**
     * 事件类型
     */
    readonly event_type: number

    /**
     * 群号，用途不明
     */
    readonly group_id: number

    constructor(payload: any) {
        super(payload)
        this.user_id = payload.user_id
        this.status_text = payload.status_text
        this.event_type = payload.event_type
        this.group_id = payload.group_id
    }
}