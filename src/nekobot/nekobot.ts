import fs from "node:fs"
import {Client} from "../../onebot/OneBot"
import {init, Logger} from "./utils/Logger";
import {Plugin} from "./plugin/Plugin";

init()

const logger = new Logger("NekoBot")

const config_file = "./config.json"
const default_config = {
    token: null,
    host: "127.0.0.1",
    port: 3001
}
if (!fs.existsSync(config_file)) {
    fs.writeFileSync(
        config_file,
        JSON.stringify(default_config, null, 4)
    )
}
let config: any = {}
try {
    config = JSON.parse(fs.readFileSync(config_file, "utf8"))
} catch (e) {
    logger.error("读取配置文件失败！", e)
    process.exit(1)
}

const token = config.token
if (!token) {
    logger.error("未填写 Token！")
    process.exit(1)
}
const host = config.host
const port = config.port
let client
try {
    client = new Client(host, port, token)
} catch (e) {
    logger.error("连接 OneBot 失败！")
    process.exit(1)
}

const plugins: Plugin[] = []
fs.readdirSync("plugins").forEach(file => {
    if (!file.endsWith(".js")) {
        return
    }
    let name = file.substring(0, file.lastIndexOf("."))
    logger.info(`正在加载插件 [${name}]...`)
    try {
        let plugin = new Plugin(name, client)
        plugins.push(plugin)

        plugin.onEnable()
    } catch (e: any) {
        logger.error(e.message)
    }
})

client.on("open", () => {
    logger.info("成功启动 NekoBot!")
})