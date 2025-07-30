import {NoticeEvent} from "./NoticeEvent";

export class RecallEvent extends NoticeEvent {
    readonly message_id: number
    readonly user_id: number

    constructor(payload: any) {
        super(payload)
        this.message_id = payload.message_id
        this.user_id = payload.user_id
    }
}