"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupRecallEvent = void 0;
const GroupNoticeEvent_1 = require("./GroupNoticeEvent");
class GroupRecallEvent extends GroupNoticeEvent_1.GroupNoticeEvent {
    constructor(payload) {
        super(payload);
        this.message_id = payload.message_id;
        this.user_id = payload.user_id;
        this.operator_id = payload.operator_id;
    }
}
exports.GroupRecallEvent = GroupRecallEvent;
