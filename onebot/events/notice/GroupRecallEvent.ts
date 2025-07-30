import {RecallEvent} from "./RecallEvent";

export class GroupRecallEvent extends RecallEvent {
    /**
     * 撤回消息的群号
     */
    readonly group_id: number

    /**
     * 撤回者 ID
     */
    readonly operator_id: number

    constructor(payload: any) {
        super(payload)
        this.group_id = payload.group_id
        this.operator_id = payload.operator_id
    }
}