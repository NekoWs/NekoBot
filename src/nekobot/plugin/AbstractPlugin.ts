import {Logger} from "../utils/Logger";
import {Client} from "../../../onebot/OneBot";

export abstract class AbstractPlugin {
    readonly name: string
    readonly description: string
    readonly logger: Logger
    readonly client: Client

    protected constructor(name: string, description: string, client: Client) {
        this.name = name
        this.description = description
        this.logger = new Logger(this.name)
        this.client = client
    }

    abstract onEnable(): void
}