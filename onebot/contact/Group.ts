import {Action} from "../utils/Action";
import {MessageChain} from "../message/MessageChain";
import {MessageBuilder} from "../message/MessageBuilder";
import {Client} from "../OneBot";
import {Member} from "./Member";

export class Group {
    readonly group_id: number
    readonly group_name: string
    readonly member_count: number
    readonly max_member_count: number
    readonly client: Client

    /**
     * 获取群成员列表
     */
    get members(): Promise<Member[]> {
        return new Promise<Member[]>((resolve, reject) => {
            let members: Member[] = []
            this.client.send(new Action("get_group_member_list", {
                group_id: this.group_id,
            })).then(data => {
                for (let member of data) {
                    members.push(new Member(member, this.client))
                }
            }).catch(reject)
            resolve(members)
        })
    }

    /**
     * 获取成员
     *
     * @param user_id 用户 ID
     * @param no_cache 是否禁用缓存
     */
    async getMember(user_id: number, no_cache: boolean = false): Promise<Member> {
        return this.client.send(new Action("get_group_member_info", {
            group_id: this.group_id,
            user_id: user_id,
            no_cache: no_cache
        })).then(data => {
            if (data.retcode !== 0) {
                throw new Error(data.message)
            }
            return new Member(data.data, this.client)
        })
    }

    /**
     * 发送群消息
     *
     * @param message 消息
     */
    sendMessage(message: any): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            let msg: MessageChain
            if (message instanceof MessageChain) {
                msg = message
            } else {
                let mb = new MessageBuilder()
                msg = mb.append(message).build()
            }
            this.client.send(new Action("send_msg", {
                group_id: this.group_id,
                message: msg.toJson(),
            })).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message)
                    return
                }
                resolve(data.data.message_id)
            }).catch(reject)
        })
    }

    constructor(payload: any, client: Client) {
        this.group_id = payload.group_id
        this.group_name = payload.group_name
        this.member_count = payload.member_count
        this.max_member_count = payload.max_member_count
        this.client = client
    }
}