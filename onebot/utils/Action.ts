export class Action {
    private readonly action: string
    private readonly params: {}

    /**
     * OneBot API 对象
     *
     * @param action 要进行的动作
     * @param params 参数列表
     */
    constructor(action: string, params?: {}) {
        this.action = action
        this.params = params || {}
    }

    /**
     * 转换为 JSON 文本
     */
    toString() {
        return JSON.stringify({
            action: this.action,
            params: this.params
        })
    }
}