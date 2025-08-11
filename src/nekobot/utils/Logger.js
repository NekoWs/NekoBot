"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.init = init;
const node_fs_1 = __importDefault(require("node:fs"));
const DateFormatter_1 = require("./DateFormatter");
let log;
let currentTime;
function init(first = true) {
    if (!node_fs_1.default.existsSync("logs")) {
        node_fs_1.default.mkdirSync("logs");
    }
    currentTime = new Date();
    let time = `${currentTime.getFullYear()}-${currentTime.getMonth() + 1}-${currentTime.getDate()}`;
    let file;
    let i = 1;
    while (node_fs_1.default.existsSync(file = `logs/${time}-${i}.log`)) {
        i++;
    }
    try {
        node_fs_1.default.writeFileSync(file, "");
        log = file;
    }
    catch (e) {
        console.error("[Logger] [ERROR] ", e);
        process.exit(1);
    }
    if (first) {
        setInterval(() => {
            let now = new Date();
            if (currentTime.getDay() !== now.getDate()) {
                init(false);
            }
        }, 1000);
    }
}
var levels;
(function (levels) {
    levels["INFO"] = "INFO";
    levels["ERROR"] = "ERROR";
    levels["WARNING"] = "WARNING";
})(levels || (levels = {}));
class Logger {
    constructor(prefix) {
        this.prefix = prefix;
    }
    print(message, level, ...args) {
        let now = new Date();
        let msg = `[${DateFormatter_1.DateFormatter.format(now, DateFormatter_1.DateFormatter.Formats.TIME)}] [${this.prefix}] [${level}] ${message}`;
        node_fs_1.default.appendFileSync(log, msg + ` ${args.map(it => { return it.toString(); }).join(" ")}\n`);
        switch (level) {
            case levels.INFO:
                console.info(msg, ...args);
                break;
            case levels.ERROR:
                console.error(msg, ...args);
                break;
            case levels.WARNING:
                console.warn(msg, ...args);
                break;
        }
    }
    info(message, ...args) {
        this.print(message, levels.INFO, ...args);
    }
    error(message, ...args) {
        this.print(message, levels.ERROR, ...args);
    }
    warn(message, ...args) {
        this.print(message, levels.WARNING, ...args);
    }
}
exports.Logger = Logger;
