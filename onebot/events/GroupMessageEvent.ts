import {MessageEvent} from "./MessageEvent";
import {Group} from "../contact/Group";
import {Action} from "../utils/Action";

export class GroupMessageEvent extends MessageEvent {
    readonly group_id: number

    /**
     * 获取群
     */
    get group(): Promise<Group> {
        return this.client.getGroup(this.group_id)
    }

    /**
     * 标记已读群消息
     */
    markRead() {
        void this.client.send(new Action("mark_group_msg_as_read", {
            group_id: this.group_id,
        }))
    }
    constructor(payload: any) {
        super(payload);
        this.group_id = payload.group_id
    }
}