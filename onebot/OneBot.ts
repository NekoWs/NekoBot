/* 使用反向 WebSocket 调用支持 OneBot 协议的框架 */
import {Event} from "./events/Event"
import {Action} from "./utils/Action"
import {MessageEvent} from "./events/MessageEvent"
import {PrivateMessageEvent} from "./events/PrivateMessageEvent";
import {Group} from "./contact/Group";
import {Friend} from "./contact/Friend";
import {NoticeEvent} from "./events/notice/NoticeEvent";
import {PokeEvent} from "./events/notice/PokeEvent";
import {GroupMessageEvent} from "./events/GroupMessageEvent";
import {FriendRecallEvent} from "./events/notice/FiendRecallEvent";
import {GroupRecallEvent} from "./events/notice/GroupRecallEvent";
import {GroupBanEvent} from "./events/notice/GroupBanEvent";
import {OpenEvent} from "./events/OpenEvent";
import {HeartBeatEvent} from "./events/HeartBeatEvent";
import {LifeCycleEvent} from "./events/LifeCycleEvent";

class Pair<T> {
    constructor(public first: T, public second: T) { }
}

export const bots = new Map<number, Client>()

type EventMap = {
    open:                       OpenEvent,          // [x] 连接成功事件
    meta_event:                 Event,              // [x] 元事件
    lifecycle:                  LifeCycleEvent,     // [x] 生命周期
    heartbeat:                  HeartBeatEvent,     // [x] 心跳
    message:                    MessageEvent,       // [x] 消息事件
    private_message:            MessageEvent,       // [x] 私聊事件
    group_message:              GroupMessageEvent,  // [x] 群聊事件
    message_sent:               Event,              // [ ] 消息发送事件
    private_message_sent:       Event,              // [ ] 私聊消息发送事件
    group_message_sent:         Event,              // [ ] 群聊消息发送事件
    request:                    Event,              // [ ] 请求事件
    friend_request:             Event,              // [ ] 添加好友请求事件
    add_group_request:          Event,              // [ ] 加群请求事件
    invite_group_request:       Event,              // [ ] 邀请登录号入群
    notice:                     NoticeEvent,        // [x] 通知事件
    friend_add_notice:          Event,              // [ ] 好友添加事件
    friend_recall_notice:       FriendRecallEvent,  // [x] 好友撤回事件
    group_admin_notice:         Event,              // [ ] 群管理员变动事件
    group_ban_notice:           GroupBanEvent,      // [x] 群禁言事件
    group_card_notice:          Event,              // [ ] 群资料卡更新事件
    group_decrease_notice:      Event,              // [ ] 群成员减少事件
    group_increase_notice:      Event,              // [ ] 群成员增加事件
    group_recall_notice:        GroupRecallEvent,   // [x] 群撤回消息事件
    group_upload_notice:        Event,              // [ ] 群文件上传事件
    essence_notice:             Event,              // [ ] 群设精事件
    notify_poke_notice:         PokeEvent,          // [x] 戳一戳事件
    notify_input_status_notice: Event,              // [ ] 输入状态更新事件
    notify_title_notice:        Event,              // [ ] 群头衔变更事件
    notify_profile_like_notice: Event               // [ ] 资料卡点赞事件
}

export class Client {
    bot_id: number = -1
    private ws: WebSocket
    private handlers: Pair<(value: any) => void>[] = []
    private listeners: {
        [K in keyof EventMap]?: ((event: EventMap[K]) => any)[]
    } = {}

    /**
     * OneBot 客户端
     *
     * @param host WebSocket 服务器地址
     * @param port 端口
     * @param token Token
     */
    constructor(host: string, port: number, token: string) {
        this.ws = new WebSocket(`ws://${host}:${port}/?access_token=${token}`)

        this.ws.onerror = (e) => {
            throw e
        }

        this.ws.onopen = () => {
            this.ws.onmessage = event => {
                let data = JSON.parse(event.data)
                if (data.post_type) {
                    switch (data.post_type) {
                        case "meta_event":
                            switch (data.meta_event_type) {
                                case "lifecycle":
                                    this.emit("lifecycle", new LifeCycleEvent(data))
                                    bots.set(data.self_id, this)
                                    this.bot_id = data.self_id
                                    break
                                case "heartbeat":
                                    this.emit("heartbeat", new HeartBeatEvent(data))
                                    break
                            }
                            break
                        case "message":
                            let event
                            switch (data.message_type) {
                                case "group":
                                    event = new GroupMessageEvent(data)
                                    this.emit("group_message", event)
                                    break
                                case "private":
                                    event = new PrivateMessageEvent(data)
                                    this.emit("private_message", event)
                                    break
                                default: // other?
                                    event = new MessageEvent(data)
                                    break
                            }
                            this.emit("message", event)
                            break
                        case "message_sent":
                            // TODO: 用途不明，暂时不需要
                            break
                        case "request":
                            // TODO: 暂时无法测试
                            break
                        case "notice":
                            this.emit("notice", new NoticeEvent(data))

                            switch (data.notice_type) {
                                case "notify":
                                    switch (data.sub_type) {
                                        case "poke":
                                            this.emit("notify_poke_notice", new PokeEvent(data))
                                            break
                                    }
                                    break
                                case "group_ban":
                                    this.emit("group_ban_notice", new GroupBanEvent(data))
                                    break
                                case "friend_recall":
                                    this.emit("friend_recall_notice", new FriendRecallEvent(data))
                                    break
                                case "group_recall":
                                    this.emit("group_recall_notice", new GroupRecallEvent(data))
                                    break
                            }
                    }
                    return
                }
                let handler = this.handlers.shift()
                if (!handler) {
                    console.warn("unknown handler: ", data)
                    return
                }
                if (data.retcode !== 0) {
                    handler.second(data)
                } else {
                    handler.first(data)
                }
            }
            this.emit("open", new OpenEvent({
                time: Date.now(),
                self_id: this.bot_id,
                post_type: "meta_event"
            }))
        }
    }

    /**
     * 获取 Bot 添加的所有群聊
     */
    get groups(): Promise<Group[]> {
        return new Promise((resolve, reject) => {
            let result: Group[] = []
            this.send(new Action("get_group_list")).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message)
                    return
                }
                try {
                    for (let group of data.data) {
                        if (!group || !group.group_id) continue
                        result.push(new Group(group, this))
                    }
                } catch (e) {
                    resolve([])
                    console.error(e, data)
                }
                resolve(result)
            }).catch(reject)
        })
    }

    /**
     * 获取 Bot 的好友列表
     */
    get friends(): Promise<Friend[]> {
        return new Promise((resolve, reject) => {
            let result: Friend[] = []
            this.send(new Action("get_friend_list")).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message)
                    return
                }
                for (let friend of data.data) {
                    result.push(new Friend(friend, this))
                }
                resolve(result)
            }).catch(reject)
        })
    }

    /**
     * 请求 OneBot 接口
     *
     * @param action 操作
     */
    send(action: Action): Promise<any> {
        this.ws.send(action.toString())
        return new Promise((resolve, reject) => {
            this.handlers.push(new Pair<any>(resolve, reject))
        })
    }

    /**
     * 注册事件监听器
     *
     * @param type 监听事件类型
     * @param listener 事件函数
     */
    on<K extends keyof EventMap>(
        type: K,
        listener: (event: EventMap[K]) => void
    ) {
        if (!this.listeners[type]) {
            this.listeners[type] = []
        }
        this.listeners[type]!.push(listener)
    }

    /**
     * 清除事件监听器
     *
     * @param type 类型
     */
    clearListener<K extends keyof EventMap>(
        type: K
    ) {
        this.listeners[type] = []
    }

    /**
     * 广播一个事件
     *
     * @param type 类型
     * @param event 事件对象
     */
    emit<K extends keyof EventMap>(type: K, event: EventMap[K]) {
        try {
            for (let listener of this.listeners[type] || []) {
                listener(event)
                if (event.isStopped()) {
                    break
                }
            }
        } catch (e) {
            console.error(`Error on${type}: ${e}`)
        }
    }

    /**
     * 撤回一条消息
     *
     * @param message_id 消息ID
     */
    recall(message_id: number) {
        return this.send(new Action("delete_msg", {
            message_id: message_id,
        }))
    }

    /**
     * 发送戳一戳消息
     *
     * @param user_id 目标用户ID
     * @param group_id 发送的群，若不存在则私聊发送
     */
    poke(user_id: number, group_id: number | undefined = undefined) {
        let params: any = {
            user_id: user_id
        }
        if (group_id) {
            params.group_id = group_id
        }
        return this.send(new Action("send_poke", params))
    }

    /**
     * 获取消息
     *
     * @param msg_id 消息ID
     */
    getMsg(msg_id: number) {
        return new Promise<MessageEvent>((resolve, reject) => {
            this.send(new Action("get_msg", {
                message_id: msg_id
            })).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message)
                    return
                }
                if (!data.data) {
                    reject("data is null")
                    return
                }
                resolve(new MessageEvent(data.data))
            }).catch(reject)
        })
    }
}