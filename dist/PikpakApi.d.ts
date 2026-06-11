import { DownloadStatus } from "./enums";
import type { FileRecord, TaskListResponse, FileList, EventsResponse, AboutResponse, VipResponse, TransferQuotaResponse } from "./model";
/**
 * PikPak API 客户端类
 */
export declare class PikpakApi {
    /** PikPak API 驱动服务基础地址 */
    private static readonly PIKPAK_API_HOST;
    /** PikPak 用户认证服务基础地址 */
    private static readonly PIKPAK_USER_HOST;
    /** OAuth 客户端 ID */
    private static readonly CLIENT_ID;
    /** OAuth 客户端密钥 */
    private static readonly CLIENT_SECRET;
    /** Pikpak 用户名 */
    private username?;
    /** Pikpak 密码 */
    private password?;
    /** 编码后的令牌字符串（Base64 编码的 access_token 和 refresh_token） */
    private encodedToken?;
    /** 访问令牌 */
    private accessToken?;
    /** 刷新令牌 */
    private refreshToken?;
    /** 用户 ID */
    private userId?;
    /** Axios HTTP 客户端实例 */
    private axiosInstance;
    /** 路径到文件夹 ID 的缓存映射 */
    private pathIdCache;
    /** 设备 ID */
    deviceId: string;
    /** 验证码令牌，用于人机验证 */
    private captchaToken?;
    /**
     * 创建一个 PikpakApi 实例
     * @param username Pikpak 用户名
     * @param password Pikpak 密码
     * @param encodedToken 已编码的包含访问令牌和刷新令牌的令牌字符串
     * @param axiosClientArgs 可选的 Axios 配置参数
     */
    constructor(username?: string, password?: string, encodedToken?: string, axiosClientArgs?: Record<string, any>);
    /**
     * 构建 HTTP 请求头
     * @param accessToken - 可选的访问令牌，用于覆盖当前实例的令牌
     * @returns 包含认证信息、设备标识和内容类型的请求头对象
     */
    private getHeaders;
    /**
     * 发起 HTTP 请求，自动处理令牌刷新和错误响应
     * @param method - HTTP 请求方法
     * @param url - 请求 URL
     * @param data - 请求体数据（可选）
     * @param params - URL 查询参数（可选）
     * @param headers - 自定义请求头（可选），不传则使用默认头
     * @param retry - 内部重试计数器，首次调用无需传入
     * @returns API 响应的 JSON 数据
     * @throws {PikpakException} 请求失败或 API 返回错误时抛出
     */
    private makeRequest;
    /**
     * 发送 GET 请求
     * @param url - 请求 URL
     * @param params - URL 查询参数
     * @returns API 响应的 JSON 数据
     */
    private requestGet;
    /**
     * 发送 POST 请求
     * @param url - 请求 URL
     * @param data - 请求体数据
     * @param headers - 自定义请求头
     * @returns API 响应的 JSON 数据
     */
    private requestPost;
    /**
     * 发送 PATCH 请求
     * @param url - 请求 URL
     * @param data - 请求体数据
     * @returns API 响应的 JSON 数据
     */
    private requestPatch;
    /**
     * 发送 DELETE 请求
     * @param url - 请求 URL
     * @param params - URL 查询参数
     * @param data - 请求体数据
     * @returns API 响应的 JSON 数据
     */
    private requestDelete;
    /**
     * 解码 Base64 编码的令牌字符串，解析出 access_token 和 refresh_token
     * @throws {PikpakException} 令牌字符串无效时抛出
     */
    private decodeToken;
    /**
     * 将当前 access_token 和 refresh_token 编码为 Base64 字符串
     */
    private encodeToken;
    /**
     * 初始化验证码
     * @returns Promise<any> 包含初始化结果的 Promise
     */
    captchaInit(): Promise<any>;
    /**
     * 使用用户名和密码登录 Pikpak
     * @returns 无返回值
     * @throws {PikpakException} 登录失败时抛出
     */
    login(): Promise<void>;
    /**
     * 刷新访问令牌
     * @returns 无返回值
     * @throws {PikpakException} 刷新令牌失败时抛出
     */
    refreshAccessToken(): Promise<void>;
    /**
     * 获取用户信息
     * @returns  用户信息对象
     */
    getUserInfo(): {
        username: string | undefined;
        userId: string | undefined;
        accessToken: string | undefined;
        refreshToken: string | undefined;
        encodedToken: string | undefined;
    };
    /**
     * 创建文件夹
     * @param name 文件夹名称，默认为 "新建文件夹"
     * @param parentId 父文件夹 ID，默认为根目录
     * @returns Promise<any> 包含创建结果的 Promise
     */
    createFolder(name?: string, parentId?: string): Promise<any>;
    /**
     * 将文件或文件夹移动到回收站
     * @param ids 要移动到回收站的文件或文件夹 ID 列表
     * @returns Promise<any> 包含操作结果的 Promise
     */
    deleteToTrash(ids: string[]): Promise<any>;
    /**
     * 将文件或文件夹移出回收站
     * @param ids 要移出回收站的文件或文件夹 ID 列表
     * @returns Promise<any> 包含操作结果的 Promise
     */
    untrash(ids: string[]): Promise<any>;
    /**
     * 永久删除文件或文件夹
     * @param ids 要永久删除的文件或文件夹 ID 列表
     * @returns Promise<any> 包含操作结果的 Promise
     */
    deleteForever(ids: string[]): Promise<any>;
    /**
     * 离线下载文件
     * @param fileUrl 文件链接
     * @param parentId 父文件夹 ID，不传默认存储到 My Pack
     * @param name 文件名，不传默认为文件链接的文件名
     * @returns Promise<any> 包含操作结果的 Promise
     */
    offlineDownload(fileUrl: string, parentId?: string, name?: string): Promise<any>;
    /**
     * 获取离线下载列表
     * @param size 每次请求的数量，默认为 10000
     * @param nextPageToken 下一页的 page token
     * @param phase 离线下载任务状态，默认为 ["PHASE_TYPE_RUNNING", "PHASE_TYPE_ERROR"]
     *   支持的值：PHASE_TYPE_RUNNING, PHASE_TYPE_ERROR, PHASE_TYPE_COMPLETE, PHASE_TYPE_PENDING
     * @returns {Promise<TaskListResponse>} 包含任务列表的响应
     */
    offlineList(size?: number, nextPageToken?: string, phase?: string[]): Promise<TaskListResponse>;
    /**
     * 获取离线下载任务状态
     * @param taskId 离线下载任务 ID
     * @param fileId 离线下载文件 ID
     * @returns Promise<DownloadStatus> 表示下载状态的 Promise
     */
    getTaskStatus(taskId: string, fileId: string): Promise<DownloadStatus>;
    /**
     * 获取离线下载文件信息
     * @param fileId 离线下载文件 ID
     * @returns Promise<any> 包含操作结果的 Promise
     */
    offlineFileInfo(fileId: string): Promise<any>;
    /**
     * 获取文件列表
     * @param size 每次请求的数量，默认为 所有
     * @param parentId 父文件夹 ID，默认为 根目录
     * @param nextPageToken 下一页的分页令牌
     * @param additionalFilters 额外的过滤条件
     * @returns Promise<FileList> 包含文件列表的 Promise
     */
    fileList(size?: number, parentId?: string, nextPageToken?: string, additionalFilters?: Record<string, any>): Promise<FileList>;
    /**
     * 获取最近添加事件列表
     * @param size 每次请求的数量，默认为 100，设置为 0 则请求所有
     * @param nextPageToken 下一页的 page token
     * @returns {Promise<EventsResponse>} 包含事件列表的响应
     */
    events(size?: number, nextPageToken?: string): Promise<EventsResponse>;
    /**
     * 重试离线下载任务
     * @param taskId 离线下载任务 ID
     * @returns Promise<any> 包含操作结果的 Promise
     * @throws {PikpakException} 重试离线下载任务失败时抛出异常
     */
    offlineTaskRetry(taskId: string): Promise<any>;
    /**
     * 根据任务 ID 删除任务
     * @param taskIds 要删除的任务 ID 列表
     * @param deleteFiles 是否同时删除文件，默认为 false
     * @returns Promise<void> 表示操作完成的 Promise
     * @throws {PikpakException} 删除任务失败时抛出异常
     */
    deleteTasks(taskIds: string[], deleteFiles?: boolean): Promise<void>;
    /**
     * 将形如 /path/a/b 的路径转换为 文件夹的id
     * @param path 路径字符串
     * @param create 是否创建不存在的文件夹
     * @returns 文件夹 ID 列表
     */
    pathToId(path: string, create?: boolean): Promise<FileRecord[]>;
    /**
     * 批量移动文件
     * @param ids 文件 ID 列表
     * @param toParentId 目标文件夹 ID，默认为根目录
     * @returns  API 响应数据
     */
    fileBatchMove(ids: string[], toParentId?: string): Promise<Record<string, any>>;
    /**
     * 批量复制文件
     * @param ids 文件 ID 列表
     * @param toParentId 目标文件夹 ID，默认为根目录
     * @returns Pikpak API 返回的结果
     */
    fileBatchCopy(ids: string[], toParentId?: string): Promise<Record<string, any>>;
    /**
     * 根据路径移动或复制文件
     * @param fromPaths 要移动或复制的文件路径列表
     * @param toPath 移动或复制到的路径
     * @param move 是否移动，默认为复制
     * @param create 是否创建不存在的文件夹，默认为 false
     * @returns Pikpak API 返回的结果
     */
    fileMoveOrCopyByPath(fromPaths: string[], toPath: string, move?: boolean, create?: boolean): Promise<any>;
    /**
     * 获取文件的下载链接
     * @param fileId 文件 ID
     * @returns 包含文件详细信息的对象
     *
     *  - 使用 `medias[0].link.url` 在流媒体服务或工具中以高速流式传输。
     *  - 使用 `web_content_link` 下载文件。
     */
    getDownloadUrl(fileId: string): Promise<any>;
    /**
     * 重命名文件
     * @param id - 文件 ID
     * @param newFileName - 新的文件名
     * @returns 更新后的文件信息
     * @throws {PikpakException} 文件重命名失败时抛出
     */
    fileRename(id: string, newFileName: string): Promise<any>;
    /**
     * 批量给文件加星标
     * @param ids 文件 ID 列表
     * @returns Pikpak API 返回的结果
     */
    fileBatchStar(ids: string[]): Promise<any>;
    /**
     * 批量取消文件星标
     * @param ids 文件 ID 列表
     * @returns Pikpak API 返回的结果
     */
    fileBatchUnstar(ids: string[]): Promise<any>;
    /**
     * 获取已加星标的文件列表
     * @param size 每次请求的数量，默认为 100
     * @param nextPageToken 下一页的分页令牌，用于获取更多结果
     * @returns Pikpak API 返回的结果，包含已加星标的文件列表
     */
    fileStarList(size?: number, nextPageToken?: string): Promise<any>;
    /**
     * 批量分享文件
     * @param ids 文件 ID 列表
     * @param needPassword 是否需要分享密码，默认为 false
     * @param expirationDays 分享链接的有效天数，默认为 -1（永久有效）
     * @returns Pikpak API 返回的结果，包含分享链接信息
     */
    fileBatchShare(ids: string[], needPassword?: boolean, expirationDays?: number): Promise<any>;
    /**
     * 获取当前用户的空间配额信息
     * @returns {Promise<AboutResponse>} 包含空间配额和用量的响应
     */
    getQuotaInfo(): Promise<AboutResponse>;
    /**
     * 获取邀请码
     * @returns {Promise<string>} 邀请码字符串
     */
    getInviteCode(): Promise<string>;
    /**
     * 获取 VIP 信息
     * @returns {Promise<VipResponse>} 包含 VIP 类型、过期时间等信息的响应
     */
    getVipInfo(): Promise<VipResponse>;
    /**
     * 获取传输配额信息
     * @returns {Promise<TransferQuotaResponse>} 包含离线下载、上传、下载等传输配额信息的响应
     */
    getTransferQuota(): Promise<TransferQuotaResponse>;
    /**
     * 设置设备 ID
     * @param deviceId 设备 ID
     */
    setDeviceId(deviceId: string): void;
}
