import fs from "node:fs";
import {DateFormatter} from "./DateFormatter";

let log: fs.PathOrFileDescriptor
let currentTime: Date

export function init(first: boolean = true) {
    if (!fs.existsSync("logs")) {
        fs.mkdirSync("logs")
    }
    currentTime = new Date()
    let time = `${currentTime.getFullYear()}-${currentTime.getMonth()+1}-${currentTime.getDate()}`
    let file
    let i = 1
    while (fs.existsSync(file = `logs/${time}-${i}.log`)) {
        i ++
    }
    try {
        fs.writeFileSync(file, "")
        log = file
    } catch (e) {
        console.error("[Logger] [ERROR] ", e)
        process.exit(1)
    }
    if (first) {
        setInterval(() => {
            let now = new Date()
            if (currentTime.getDate() !== now.getDate()) {
                init(false)
            }
        }, 1000)
    }
}

enum levels {
    INFO = "INFO", ERROR = "ERROR", WARNING = "WARNING"
}

export class Logger {
    readonly prefix: string
    constructor(prefix: string) {
        this.prefix = prefix
    }

    private print(message: any, level: levels, ...args: any[]) {
        let now = new Date()
        let msg = `[${DateFormatter.format(now, DateFormatter.Formats.TIME)}] [${this.prefix}] [${level}] ${message}`
        fs.appendFileSync(log, msg + ` ${args.map(it => { return it.toString()}).join(" ")}\n`)
        switch (level) {
            case levels.INFO:
                console.info(msg, ...args)
                break
            case levels.ERROR:
                console.error(msg, ...args)
                break
            case levels.WARNING:
                console.warn(msg, ...args)
                break
        }
    }

    info(message: any, ...args: any[]) {
        this.print(message, levels.INFO, ...args)
    }

    error(message: any, ...args: any[]) {
        this.print(message, levels.ERROR, ...args)
    }

    warn(message: any, ...args: any[]) {
        this.print(message, levels.WARNING, ...args)
    }
}