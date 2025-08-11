"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const AbstractPlugin_1 = require("../src/nekobot/plugin/AbstractPlugin");
const Timing_1 = require("./libs/Timing");
const messages = JSON.parse(node_fs_1.default.readFileSync("alerts.json", "utf8"));
let groups = [];
function random(array) {
    if (!array)
        throw new Error("array is null");
    if (array.length < 1)
        throw Error("array is empty");
    if (array.length < 2)
        return array[0];
    return array[Math.floor(Math.random() * array.length)];
}
function rand(min, max) {
    return Math.random() * (max - min) + min;
}
function broadcast(msg, delay = 0, blacklist = []) {
    let whitelist = [];
    let result = [];
    let current_delay = 0;
    for (let group of groups) {
        let flag = false;
        for (let black of blacklist) {
            if (group.group_id === black.group_id) {
                flag = true;
                break;
            }
        }
        if (flag)
            continue;
        whitelist.push(group);
    }
    for (let group of whitelist) {
        setTimeout(() => {
            result.push(group.sendMessage(msg()));
        }, current_delay);
        current_delay += delay;
    }
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve(result);
        }, current_delay);
    });
}
const timing = new Timing_1.Timing();
const tasks = [
    {
        time: new Timing_1.Time(8, 30, 0),
        message: messages.morning
    },
    {
        time: new Timing_1.Time(11, 30, 0),
        message: messages.afternoon
    },
    {
        time: new Timing_1.Time(23, 0, 0),
        message: messages.night
    }
];
module.exports = {
    name: "TimerBot",
    description: "整点报时器",
    plugin: class TimerBot extends AbstractPlugin_1.AbstractPlugin {
        onEnable() {
            this.client.on("open", () => {
                this.client.groups.then(g => {
                    groups = g;
                });
            });
            for (let task_data of tasks) {
                let task = new Timing_1.TimingTask(task_data.time, () => {
                    void broadcast(() => {
                        return random(task_data.message);
                    }, 1000);
                    setTimeout(() => {
                        timing.addTiming(task);
                    }, 1000);
                });
                timing.addTiming(task);
            }
        }
    }
};
