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
Object.defineProperty(exports, "__esModule", { value: true });
const OneBot_1 = require("../../onebot/OneBot");
const child_process = __importStar(require("node:child_process"));
const HeartBeatEvent_1 = require("../../onebot/events/HeartBeatEvent");
const MessageEvent_1 = require("../../onebot/events/MessageEvent");
const LifeCycleEvent_1 = require("../../onebot/events/LifeCycleEvent");
const OpenEvent_1 = require("../../onebot/events/OpenEvent");
const PokeEvent_1 = require("../../onebot/events/notice/PokeEvent");
function zipTest() {
    let cwd = process.cwd();
    cwd = cwd.substring(cwd.lastIndexOf("/") + 1);
    let zip = `${cwd}/exec/7z.exe`;
    let caches = `${cwd}/caches`;
    let jc = "测试本子";
    let pwd = "NekoWs";
    child_process.exec(`${zip} a ${caches}/${jc}-A.zip ${caches}/${jc}/`, (err, stdout) => {
        if (!err) {
            child_process.exec(`${zip} a ${caches}/${jc}.zip ${caches}/${jc}-A.zip -p${pwd}`, (err, stdout) => {
                console.log(stdout, err);
            });
        }
    });
}
function main() {
    let client = new OneBot_1.Client("117.72.204.71", 3001, "NekoBot");
    client.on("event", e => {
        if (e instanceof HeartBeatEvent_1.HeartBeatEvent ||
            e instanceof LifeCycleEvent_1.LifeCycleEvent ||
            e instanceof OpenEvent_1.OpenEvent ||
            e instanceof PokeEvent_1.PokeEvent ||
            e instanceof MessageEvent_1.MessageEvent)
            return;
        console.log(e.raw_data);
    });
}
main();
