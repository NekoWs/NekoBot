"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokeEvent = void 0;
const NoticeEvent_1 = require("./NoticeEvent");
class PokeEvent extends NoticeEvent_1.NoticeEvent {
    constructor(payload) {
        super(payload);
        this.target_id = payload.target_id;
        this.user_id = payload.user_id;
        this.raw_info = payload.raw_info;
        this.group_id = payload.group_id || -1;
    }
}
exports.PokeEvent = PokeEvent;
