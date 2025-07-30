import {Client} from "../../onebot/OneBot";
import * as child_process from "node:child_process";

function main() {
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
main()