import {MessageChain} from "../message/MessageChain";
import {Action} from "../utils/Action";
import {Client} from "../OneBot";
import {MessageBuilder} from "../message/MessageBuilder";

export class Contact {
    readonly user_id: number
    readonly nickname: string
    readonly client: Client
    constructor(payload: any, client: Client) {
        this.user_id = payload.user_id
        this.nickname = payload.nickname
        this.client = client
    }

    /**
     * 发送私聊消息
     *
     * @param message 消息
     */
    sendMessage(message: any): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            let chain
            if (message instanceof MessageChain) {
                chain = message
            } else {
                let mb = new MessageBuilder()
                chain = mb.append(message).build()
            }
            this.client.send(new Action("send_private_msg", {
                user_id: this.user_id,
                message: chain.toJson(),
            })).then(data => {
                if (data.retcode !== 0) {
                    reject(data.message)
                    return
                }
                if (!data.data) {
                    resolve(-1)
                } else {
                    resolve(data.data.message_id)
                }
            }).catch(reject)
        })
    }
}