import {NoticeEvent} from "./NoticeEvent";

export class PokeEvent extends NoticeEvent {
    readonly target_id: number
    readonly user_id: number
    readonly raw_info: object

    constructor(payload: any) {
        super(payload)
        this.target_id = payload.target_id
        this.user_id = payload.user_id
        this.raw_info = payload.raw_info
    }
}