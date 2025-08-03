import {Client} from "../../onebot/OneBot";
import * as child_process from "node:child_process";
import {MessageBuilder} from "../../onebot/message/MessageBuilder";

function zipTest() {
    let cwd = process.cwd()
    cwd = cwd.substring(cwd.lastIndexOf("/") + 1)
    let zip = `${cwd}/exec/7z.exe`
    let caches = `${cwd}/caches`

    let jc = "测试本子"
    let pwd = "NekoWs"
    child_process.exec(`${zip} a ${caches}/${jc}-A.zip ${caches}/${jc}/`, (err, stdout) => {
        if (!err) {
            child_process.exec(`${zip} a ${caches}/${jc}.zip ${caches}/${jc}-A.zip -p${pwd}`, (err, stdout) => {
                console.log(stdout, err)
            })
        }
    })
}
function main() {
    let client = new Client("117.72.204.71", 3001, "NekoBot")
    client.on("open", () => {
        console.log("Open!")
    })
    client.on("group_message", async event => {
        let sender = event.sender
        if (sender.user_id !== 1689295608) return
        let group = await event.group.catch(() => {})
        if (!group) return
        let message = event.message
        for (let msg of message.chain) {
            if (msg.type === "reply") {
                client.getMsg(msg.data.id).then(msg => {
                    group?.sendMessage(`ReplySender: ${msg.sender.user_id}`)
                })
            }
        }
    })
}
main()