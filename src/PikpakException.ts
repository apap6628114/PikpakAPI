/**
 * Pikpak API 自定义异常
 */
export class PikpakException extends Error {
    /**
     * 创建一个 PikpakException 实例
     * @param message - 错误描述信息
     */
    constructor(message: string) {
        super(message);
        this.name = "PikpakException";
    }
}
