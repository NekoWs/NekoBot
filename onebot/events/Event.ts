import {bots, Client} from "../OneBot";

export class Event {
    /**
     * 原始 JSON 数据
     */
    readonly raw_data: any

    /**
     * 事件发生的时间戳
     */
    readonly time: number

    /**
     * 收到事件的机器人 QQ 号
     */
    readonly self_id: number

    /**
     * 上报类型
     */
    readonly post_type: string

    /**
     * 事件子类型，可能为空
     */
    readonly sub_type: string

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
        this.raw_data = payload
        this.time = payload.time
        this.self_id = payload.self_id
        this.post_type = payload.post_type
        this.sub_type = payload.sub_type
    }
}