import {Group} from "./Group";
import {Member} from "./Member";
import {Friend} from "./Friend";
import {Client} from "../OneBot";

/**
 * 消息发送者对象
 */
export class Sender {
    /**
     * 用户 ID
     */
    readonly user_id: number
    /**
     * 用户昵称
     */
    readonly nickname: string
    /**
     * 群昵称
     */
    readonly card: string
    /**
     * 群角色，群员为 'member' 管理员为 'admin' 群主为 'owner'
     */
    readonly role: string | undefined

    /**
     * 转换为群成员
     *
     * @param group 群
     * @param no_cache 不使用缓存
     */
    async asMember(group: Group, no_cache: boolean = false): Promise<Member> {
        return group.getMember(this.user_id, no_cache)
    }

    /**
     * 转换为好友
     *
     * @param client 客户端
     */
    async asFriend(client: Client): Promise<Friend> {
        return client.friends.then(friends => {
            for (const friend of friends) {
                if (friend.user_id == this.user_id) {
                    return friend;
                }
            }
            throw new Error("friend not found")
        })
    }
    constructor(payload: any) {
        this.user_id = payload.user_id
        this.nickname = payload.nickname
        this.card = payload.card
        this.role = payload.role
    }
}