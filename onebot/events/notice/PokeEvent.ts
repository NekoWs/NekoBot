import {NoticeEvent} from "./NoticeEvent";

export class PokeEvent extends NoticeEvent {
    /**
     * 被戳的 QQ 号
     */
    readonly target_id: number

    /**
     * 戳一戳发送者 QQ 号
     */
    readonly user_id: number

    /**
     * 戳一戳原始信息
     */
    readonly raw_info: object

    /**
     * 戳一戳的群，当私聊时为 -1
     */
    readonly group_id: number

    constructor(payload: any) {
        super(payload)
        this.target_id = payload.target_id
        this.user_id = payload.user_id
        this.raw_info = payload.raw_info
        this.group_id = payload.group_id || -1
    }
}