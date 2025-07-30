import {AbstractPlugin} from "./AbstractPlugin"
import {Client} from "../../../onebot/OneBot"

export class Plugin {
    enabled = false

    readonly module: any
    readonly path: string
    readonly plugin: AbstractPlugin

    constructor(path: string, client: Client) {
        this.module = require("../../../plugins/" + path)
        this.plugin = new this.module.plugin(
            this.module.name,
            this.module.description,
            client
        )
        this.path = path
    }

    onEnable() {
        this.enabled = true
        this.plugin.onEnable()
    }
}