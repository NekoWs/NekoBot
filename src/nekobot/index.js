"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
require("ws");
const fs = __importStar(require("node:fs"));
const OneBot_1 = require("../../onebot/OneBot");
const Timing_1 = require("../../plugins/libs/Timing");
const config_file = "./config.json";
const data_file = "./data.json";
const default_config = {
    token: null,
    host: "127.0.0.1",
    port: 3001,
    master: []
};
if (!fs.existsSync(config_file)) {
    fs.writeFileSync(config_file, JSON.stringify(default_config, null, 4));
}
if (!fs.existsSync(data_file)) {
    fs.writeFileSync(data_file, "{}");
}
let config = {};
let data = {};
try {
    config = JSON.parse(fs.readFileSync(config_file, "utf8"));
    data = JSON.parse(fs.readFileSync(data_file, "utf8"));
}
catch (e) {
    console.error("读取配置文件失败！", e);
    process.exit(1);
}
const token = config.token;
if (!token) {
    console.error("未填写 Token！请检查！");
    process.exit(1);
}
const host = config.host;
const port = config.port;
let client;
try {
    client = new OneBot_1.Client(host, port, token);
}
catch (e) {
    console.error("连接 OneBot 失败！");
    process.exit(1);
}
let groups = [];
const masters = config.master;
client.on("open", () => __awaiter(void 0, void 0, void 0, function* () {
    groups = yield client.groups;
    for (let group of groups) {
        console.log(group.group_name + "(" + group.group_id + ")");
    }
    console.log("NekoBot Running!");
}));
const messages = JSON.parse(fs.readFileSync("alerts.json", "utf8"));
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
        time: new Timing_1.Time(7, 30, 0),
        message: messages.morning
    },
    {
        time: new Timing_1.Time(12, 0, 0),
        message: messages.afternoon
    },
    {
        time: new Timing_1.Time(22, 0, 0),
        message: messages.night
    }
];
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
const users = new Map();
function save_data() {
    for (let id of users.keys()) {
        let user = users.get(id);
        if (!user)
            continue;
        data[id] = user.toJson();
    }
    fs.writeFileSync(data_file, JSON.stringify(data, null, 4));
}
class User {
    constructor(data, user_id) {
        this.fav = 0;
        this.neko_cost = -1;
        this.last_sign = 0;
        this.fav = data.fav || 0;
        this.neko_cost = data.neko_cost || -1;
        this.last_sign = data.last_sign || 0;
        this.user_id = user_id;
    }
    change_fav(fav) {
        this.fav += fav;
        save_data();
    }
    change_cost(cost) {
        this.neko_cost += cost;
        save_data();
    }
    sign() {
        let now = new Date(Date.now());
        let last = new Date(this.last_sign);
        let now_str = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        let last_str = `${last.getFullYear()}-${last.getMonth() + 1}-${last.getDate()}`;
        if (now_str === last_str) {
            return -1;
        }
        let add = Math.floor(rand(1, 10));
        this.last_sign = Date.now();
        this.change_cost(add);
        return add;
    }
    toJson() {
        return {
            fav: this.fav,
            neko_cost: this.neko_cost,
            last_sign: this.last_sign
        };
    }
}
for (let id in data) {
    let u = data[id];
    let user_id = Number(id);
    users.set(user_id, new User(u, user_id));
}
function getUser(user_id) {
    return users.get(user_id);
}
const sentences = /([^。?!？！]+[。?!？！])/ig;
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
