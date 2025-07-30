import {bots, Client} from "../OneBot";

export class Event {
    readonly time: number
    readonly self_id: number
    readonly post_type: string

    private stopped = false
    get client(): Client {
        if (!bots.has(this.self_id)) {
            throw Error(`Client ID ${this.self_id} not found`)
        }
        return bots.get(this.self_id)!
    }

    /**
     * 使事件停止广播
     */
    stopPropagation() {
        this.stopped = true
    }

    isStopped() {
        return this.stopped
    }

    /**
     * 事件基类
     *
     * @param payload 数据
     */
    constructor(payload: any) {
        this.time = payload.time
        this.self_id = payload.self_id
        this.post_type = payload.post_type
    }
}