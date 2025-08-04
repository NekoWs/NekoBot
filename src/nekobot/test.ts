import {Client} from "../../onebot/OneBot";
import * as child_process from "node:child_process";
import {MessageBuilder} from "../../onebot/message/MessageBuilder";
import fs from "node:fs";
import {HeartBeatEvent} from "../../onebot/events/HeartBeatEvent";
import {PrivateMessageEvent} from "../../onebot/events/PrivateMessageEvent";
import {MessageEvent} from "../../onebot/events/MessageEvent";
import {LifeCycleEvent} from "../../onebot/events/LifeCycleEvent";
import {GroupMessageEvent} from "../../onebot/events/GroupMessageEvent";
import {OpenEvent} from "../../onebot/events/OpenEvent";
import {PokeEvent} from "../../onebot/events/notice/PokeEvent";

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
    client.on("event", e => {
        if (
            e instanceof HeartBeatEvent ||
            e instanceof LifeCycleEvent ||
            e instanceof OpenEvent ||
            e instanceof PokeEvent ||
            e instanceof MessageEvent
        ) return
        console.log(e.raw_data)
    })
}
main()