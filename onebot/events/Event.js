"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const OneBot_1 = require("../OneBot");
class Event {
    get client() {
        if (!OneBot_1.bots.has(this.self_id)) {
            throw Error(`Client ID ${this.self_id} not found`);
        }
        return OneBot_1.bots.get(this.self_id);
    }
    /**
     * 使事件停止广播
     */
    stopPropagation() {
        this.stopped = true;
    }
    isStopped() {
        return this.stopped;
    }
    /**
     * 事件基类
     *
     * @param payload 数据
     */
    constructor(payload) {
        this.stopped = false;
        this.time = payload.time;
        this.self_id = payload.self_id;
        this.post_type = payload.post_type;
    }
}
exports.Event = Event;
