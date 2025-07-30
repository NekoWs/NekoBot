"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const OneBot_1 = require("../../onebot/OneBot");
const Logger_1 = require("./utils/Logger");
const Plugin_1 = require("./plugin/Plugin");
(0, Logger_1.init)();
const logger = new Logger_1.Logger("NekoBot");
const config_file = "./config.json";
const default_config = {
    token: null,
    host: "127.0.0.1",
    port: 3001
};
if (!node_fs_1.default.existsSync(config_file)) {
    node_fs_1.default.writeFileSync(config_file, JSON.stringify(default_config, null, 4));
}
let config = {};
try {
    config = JSON.parse(node_fs_1.default.readFileSync(config_file, "utf8"));
}
catch (e) {
    logger.error("读取配置文件失败！", e);
    process.exit(1);
}
const token = config.token;
if (!token) {
    logger.error("未填写 Token！");
    process.exit(1);
}
const host = config.host;
const port = config.port;
let client;
try {
    client = new OneBot_1.Client(host, port, token);
}
catch (e) {
    logger.error("连接 OneBot 失败！");
    process.exit(1);
}
const plugins = [];
node_fs_1.default.readdirSync("plugins").forEach(file => {
    if (!file.endsWith(".js")) {
        return;
    }
    let name = file.substring(0, file.lastIndexOf("."));
    logger.info(`正在加载插件 [${name}]...`);
    try {
        let plugin = new Plugin_1.Plugin(name, client);
        plugins.push(plugin);
        plugin.onEnable();
    }
    catch (e) {
        logger.error(e.message);
    }
});
client.on("open", () => {
    logger.info("成功启动 NekoBot!");
});
