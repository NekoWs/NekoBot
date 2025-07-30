"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupMessageEvent = void 0;
const MessageEvent_1 = require("./MessageEvent");
const Group_1 = require("../contact/Group");
const Action_1 = require("../utils/Action");
class GroupMessageEvent extends MessageEvent_1.MessageEvent {
    /**
     * 获取群
     */
    getGroup() {
        return new Promise((resolve, reject) => {
            this.client.send(new Action_1.Action("get_group_info", {
                group_id: this.group_id,
            })).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message);
                    return;
                }
                if (!data.data) {
                    resolve(null);
                    return;
                }
                resolve(new Group_1.Group(data.data, this.client));
            }).catch(reject);
        });
    }
    /**
     * 标记已读群消息
     */
    markRead() {
        void this.client.send(new Action_1.Action("mark_group_msg_as_read", {
            group_id: this.group_id,
        }));
    }
    constructor(payload) {
        super(payload);
        this.group_id = payload.group_id;
    }
}
exports.GroupMessageEvent = GroupMessageEvent;
