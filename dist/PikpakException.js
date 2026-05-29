"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PikpakException = void 0;
/**
 * Pikpak API 自定义异常
 */
class PikpakException extends Error {
    constructor(message) {
        super(message);
        this.name = "PikpakException";
    }
}
exports.PikpakException = PikpakException;
