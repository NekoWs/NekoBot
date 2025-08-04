import {GroupNoticeEvent} from "./GroupNoticeEvent";

export class GroupIncreaseEvent extends GroupNoticeEvent {
    /**
     * 新增的成员 QQ 号
     */
    readonly user_id: number

    /**
     * 操作者 QQ 号
     */
    readonly operator_id: number

    constructor(payload: any) {
        super(payload)
        this.user_id = payload.user_id
        this.operator_id = payload.operator_id
    }
}