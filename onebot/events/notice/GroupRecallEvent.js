"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupRecallEvent = void 0;
const RecallEvent_1 = require("./RecallEvent");
class GroupRecallEvent extends RecallEvent_1.RecallEvent {
    constructor(payload) {
        super(payload);
        this.group_id = payload.group_id;
        this.operator_id = payload.operator_id;
    }
}
exports.GroupRecallEvent = GroupRecallEvent;
