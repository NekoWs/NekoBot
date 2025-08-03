import {Client} from "../../onebot/OneBot";
import * as child_process from "node:child_process";
import {MessageBuilder} from "../../onebot/message/MessageBuilder";
import fs from "node:fs";

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
    let msg = JSON.parse(fs.readFileSync("messages.json", "utf-8"))
    let tmp: any = {}
    for (const id of Object.keys(msg)) {
        let m = msg[id]
        m.splice(0, 2)
        tmp[id] = m
    }
    fs.writeFileSync("cleared.json", JSON.stringify(tmp))
}
main()