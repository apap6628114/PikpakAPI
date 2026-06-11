"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PikpakException = void 0;
/**
 * Pikpak API 自定义异常
 */
class PikpakException extends Error {
    /**
     * 创建一个 PikpakException 实例
     * @param message - 错误描述信息
     */
    constructor(message) {
        super(message);
        this.name = "PikpakException";
    }
}
exports.PikpakException = PikpakException;
