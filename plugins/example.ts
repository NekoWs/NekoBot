import {AbstractPlugin} from "../src/nekobot/plugin/AbstractPlugin";
import {Friend} from "../onebot/contact/Friend";
import {MessageBuilder} from "../onebot/message/MessageBuilder";

module.exports = {
    name: "示范",
    description: "示范插件。",
    plugin: class ExamplePlugin extends AbstractPlugin {
        onEnable(): void {
            // 将 AbstractPlugin 中的 client 和 logger 提取到 onEnable 方法中
            const client = this.client
            const logger = this.logger

            // 监听 private_message 事件，即 私聊事件
            client.on("private_message", async function (event) {
                // 获取该消息 发送者 (Sender) 作为 好友 (Friend)
                let sender: Friend | null = await event.sender.asFriend(client).catch(err => {
                    logger.error("获取好友时发生错误：", err)
                    return null
                })
                if (!sender) {
                    // 无法获取好友则直接返回
                    return
                }

                // 如果该消息发送者 QQ 号为 1689295608
                if (sender.user_id == 1689295608) {
                    // 构建消息
                    let msg = new MessageBuilder()
                        .reply(event.message_id)  // 回复消息，提供 message_id
                        .append("测试插件！")  // 追加内容，此处添加文本
                        .build()  // 构建
                    // 发送消息并获取回调：message_id
                    sender.sendMessage(msg).then(id => {
                        logger.info(`消息发送成功，消息 ID：${id}`)
                    }).catch(err => {
                        logger.error("消息发送失败：", err)
                    })
                }
            })
            logger.info("已启用示范插件！")
        }
    }
}