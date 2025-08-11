"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sender = void 0;
/**
 * 消息发送者对象
 */
class Sender {
    /**
     * 转换为群成员
     *
     * @param group 群
     * @param no_cache 不使用缓存
     */
    async asMember(group, no_cache = false) {
        if (!this.user_id)
            throw "user_id is null";
        return group.getMember(this.user_id, no_cache);
    }
    /**
     * 转换为好友
     *
     * @param client 客户端
     */
    async asFriend(client) {
        if (!this.user_id)
            throw "user_id is null";
        return client.friends.then(friends => {
            for (const friend of friends) {
                if (friend.user_id == this.user_id) {
                    return friend;
                }
            }
            throw new Error("friend not found");
        });
    }
    constructor(payload) {
        this.user_id = payload.user_id;
        this.nickname = payload.nickname;
        this.card = payload.card;
        this.role = payload.role;
    }
}
exports.Sender = Sender;
