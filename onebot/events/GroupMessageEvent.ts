import {MessageEvent} from "./MessageEvent";
import {Group} from "../contact/Group";
import {Action} from "../utils/Action";

export class GroupMessageEvent extends MessageEvent {
    readonly group_id: number

    /**
     * 获取群
     */
    getGroup(): Promise<Group | null> {
        return new Promise<Group | null>((resolve, reject) => {
            this.client.send(new Action("get_group_info", {
                group_id: this.group_id,
            })).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message)
                    return
                }
                if (!data.data) {
                    resolve(null)
                    return
                }
                resolve(new Group(data.data, this.client))
            }).catch(reject)
        })
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