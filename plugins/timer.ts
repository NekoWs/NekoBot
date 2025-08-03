import fs from "node:fs";
import {Group} from "../onebot/contact/Group";
import {AbstractPlugin} from "../src/nekobot/plugin/AbstractPlugin";
import {Time, Timing, TimingTask} from "./libs/Timing";

const messages: any = JSON.parse(fs.readFileSync("alerts.json", "utf8"))
let groups: Group[] = []

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

module.exports = {
    name: "TimerBot",
    description: "整点报时器",
    plugin: class TimerBot extends AbstractPlugin {
        onEnable(): void {
            this.client.on("open", () => {
                this.client.groups.then(g => {
                    groups = g
                })
            })
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
        }
    }
}