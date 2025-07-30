"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
class Action {
    /**
     * OneBot API 对象
     *
     * @param action 要进行的动作
     * @param params 参数列表
     */
    constructor(action, params) {
        this.action = action;
        this.params = params || {};
    }
    /**
     * 转换为 JSON 文本
     */
    toString() {
        return JSON.stringify({
            action: this.action,
            params: this.params
        });
    }
}
exports.Action = Action;
