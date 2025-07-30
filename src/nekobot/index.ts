import 'ws'
import * as fs from "node:fs";
import {Client} from "../../onebot/OneBot";
import {Group} from "../../onebot/contact/Group";
import {MessageBuilder} from "../../onebot/message/MessageBuilder";
import {Time, Timing, TimingTask} from "../../plugins/libs/Timing";

const config_file = "./config.json"
const data_file = "./data.json"
const default_config = {
    token: null,
    host: "127.0.0.1",
    port: 3001,
    master: []
}
if (!fs.existsSync(config_file)) {
    fs.writeFileSync(
        config_file,
        JSON.stringify(default_config, null, 4)
    )
}
if (!fs.existsSync(data_file)) {
    fs.writeFileSync(data_file, "{}")
}
let config: any = {}
let data: any = {}
try {
    config = JSON.parse(fs.readFileSync(config_file, "utf8"))
    data = JSON.parse(fs.readFileSync(data_file, "utf8"))
} catch (e) {
    console.error("读取配置文件失败！", e)
    process.exit(1)
}

const token = config.token
if (!token) {
    console.error("未填写 Token！请检查！")
    process.exit(1)
}
const host = config.host
const port = config.port
let client
try {
    client = new Client(host, port, token)
} catch (e) {
    console.error("连接 OneBot 失败！")
    process.exit(1)
}
let groups: Group[] = []
const masters: number[] = config.master

client.on("open", async () => {
    groups = await client.groups
    for (let group of groups) {
        console.log(
            group.group_name + "(" + group.group_id + ")"
        )
    }

    console.log("NekoBot Running!")
})

const messages: any = JSON.parse(fs.readFileSync("messages.json", "utf8"))

function random<T>(array: Array<T>): T {
    if (!array) throw new Error("array is null")
    if (array.length < 1) throw Error("array is empty")
    if (array.length < 2) return array[0]
    return array[Math.floor(Math.random() * array.length)]
}

function rand(min: number, max: number): number {
    return Math.random() * (max - min) + min
}

function broadcast(
    msg: (() => string),
    delay: number = 0,
    blacklist: Group[] = []
) {
    let whitelist: Group[] = []
    let result: Promise<number>[] = []
    let current_delay = 0
    for (let group of groups) {
        let flag = false
        for (let black of blacklist) {
            if (group.group_id === black.group_id) {
                flag = true
                break
            }
        }
        if (flag) continue
        whitelist.push(group)
    }
    for (let group of whitelist) {
        setTimeout(() => {
            result.push(group.sendMessage(msg()))
        }, current_delay)
        current_delay += delay
    }
    return new Promise<Promise<number>[]>((resolve, _) => {
        setTimeout(() => {
            resolve(result)
        }, current_delay)
    })
}

const timing = new Timing()
const tasks = [
    {
        time: new Time(7, 30, 0),
        message: messages.morning
    },
    {
        time: new Time(12, 0, 0),
        message: messages.afternoon
    },
    {
        time: new Time(22, 0, 0),
        message: messages.night
    }
]
for (let task_data of tasks) {
    let task = new TimingTask(task_data.time, () => {
        void broadcast(() => {
            return random(task_data.message)
        }, 1000)
        setTimeout(() => {
            timing.addTiming(task)
        }, 1000)
    })
    timing.addTiming(task)
}

const users = new Map<number, User>()

function save_data() {
    for (let id of users.keys()) {
        let user = users.get(id)
        if (!user) continue
        data[id] = user.toJson()
    }
    fs.writeFileSync(data_file, JSON.stringify(data, null, 4))
}
class User {
    fav: number = 0
    neko_cost: number = -1
    user_id: number
    last_sign: number = 0
    constructor(data: any, user_id: number) {
        this.fav = data.fav || 0
        this.neko_cost = data.neko_cost || -1
        this.last_sign = data.last_sign || 0
        this.user_id = user_id
    }
    change_fav(fav: number) {
        this.fav += fav
        save_data()
    }
    change_cost(cost: number) {
        this.neko_cost += cost
        save_data()
    }
    sign(): number {
        let now = new Date(Date.now())
        let last = new Date(this.last_sign)
        let now_str = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
        let last_str = `${last.getFullYear()}-${last.getMonth() + 1}-${last.getDate()}`
        if (now_str === last_str) {
            return -1
        }
        let add = Math.floor(rand(1, 10))
        this.last_sign = Date.now()
        this.change_cost(add)
        return add
    }
    toJson(): any {
        return {
            fav: this.fav,
            neko_cost: this.neko_cost,
            last_sign: this.last_sign
        }
    }
}

for (let id in data) {
    let u = data[id]
    let user_id = Number(id)
    users.set(user_id, new User(u, user_id))
}

export function getUser(user_id: number) {
    return users.get(user_id)
}

const sentences = /([^。?!？！]+[。?!？！])/ig

// client.on("group_message", async event => {
//     let sender = event.sender
//     let group
//     try {
//         group = await event.group
//     } catch (e) {
//         console.error(e)
//         return
//     }
//     if (!group) return
//     let msg = event.message
//     let at = false
//     console.log(
//         `[${group.group_name}(${group.group_id})] ` +
//         `${sender.nickname}(${sender.user_id}): ${msg.toString()}`
//     )
//     for (let chain of msg.chain) {
//         if (chain.type === "at") {
//             if (chain.data.qq != client.bot_id) {
//                 return
//             }
//             at = true
//         } else if (chain.type === "reply") {
//             try {
//                 let reply = await client.getMsg(chain.data.id)
//                 if (reply.sender.user_id !== client.bot_id) {
//                     return
//                 }
//                 at = true
//             } catch (e) {
//                 console.log(e, chain.data.id)
//             }
//         }
//     }
//     let str = msg.toString().trim()
//
//     let user_data = users.get(sender.user_id)
//     if (!user_data) {
//         user_data = new User({}, sender.user_id)
//         users.set(sender.user_id, user_data)
//     }
//     if (at) {
//         try {
//             let msg = await chat(event)
//             if (msg.match("BREAK")) {
//                 clearMessage(event.user_id)
//                 let mb = new MessageBuilder()
//                 mb.at(sender.user_id)
//                     .append(" ")
//                     .append("不想聊这个话题了喵！")
//                 group.sendMessage(mb.build())
//             } else {
//                 let messages = msg.match(sentences) || []
//                 let delay = 0
//                 for (const msg of messages) {
//                     setTimeout(() => {
//                         group.sendMessage(msg)
//                     }, delay)
//                     delay += Math.floor(Math.random() * 1000) + 500
//                 }
//             }
//         } catch (e) {
//             console.error(e)
//         }
//     }
// })