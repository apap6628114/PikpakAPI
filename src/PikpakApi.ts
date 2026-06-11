import { DownloadStatus } from "./enums";
import { PikpakException } from "./PikpakException";
import "./model"
import axios, { AxiosInstance } from "axios";

/**
 * PikPak API 客户端类
 */
export class PikpakApi {
    /** PikPak API 驱动服务基础地址 */
    private static readonly PIKPAK_API_HOST = "api-drive.mypikpak.com";
    /** PikPak 用户认证服务基础地址 */
    private static readonly PIKPAK_USER_HOST = "user.mypikpak.com";

    /** OAuth 客户端 ID */
    private static readonly CLIENT_ID = "YNxT9w7GMdWvEOKa";
    /** OAuth 客户端密钥 */
    private static readonly CLIENT_SECRET = "dbw2OtmVEeuUvIptb1Coyg";

    /** Pikpak 用户名 */
    private username?: string;
    /** Pikpak 密码 */
    private password?: string;
    /** 编码后的令牌字符串（Base64 编码的 access_token 和 refresh_token） */
    private encodedToken?: string;
    /** 访问令牌 */
    private accessToken?: string;
    /** 刷新令牌 */
    private refreshToken?: string;
    /** 用户 ID */
    private userId?: string;
    /** Axios HTTP 客户端实例 */
    private axiosInstance: AxiosInstance;
    /** 路径到文件夹 ID 的缓存映射 */
    private pathIdCache: Record<string, FileRecord> = {};
    /** 设备 ID */
    public deviceId: string = "01J0NP4CPJR3R9XHGZZKTCFAET";
    /** 验证码令牌，用于人机验证 */
    private captchaToken?: string;

    /**
     * 创建一个 PikpakApi 实例
     * @param username Pikpak 用户名
     * @param password Pikpak 密码
     * @param encodedToken 已编码的包含访问令牌和刷新令牌的令牌字符串
     * @param axiosClientArgs 可选的 Axios 配置参数
     */
    constructor(
        username?: string,
        password?: string,
        encodedToken?: string,
        axiosClientArgs: Record<string, any> = {}
    ) {
        this.username = username;
        this.password = password;
        this.encodedToken = encodedToken;
        this.axiosInstance = axios.create(axiosClientArgs);

        if (this.encodedToken) {
            this.decodeToken();
        } else if (this.username && this.password) {
            // do nothing, wait for login
        } else {
            throw new PikpakException(
                "必须提供用户名和密码，或者已编码的令牌字符串"
            );
        }
    }

    /**
     * 构建 HTTP 请求头
     * @param accessToken - 可选的访问令牌，用于覆盖当前实例的令牌
     * @returns 包含认证信息、设备标识和内容类型的请求头对象
     */
    private getHeaders(accessToken?: string): Record<string, string> {
        const headers: Record<string, string> = {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
            "Content-Type": "application/json; charset=utf-8",
            "X-Device-Id": this.deviceId.toString(),
        };

        if (this.captchaToken) {
            headers["X-Captcha-Token"] = this.captchaToken;
        }

        if (this.accessToken) {
            headers["Authorization"] = `Bearer ${this.accessToken}`;
        } else if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        return headers;
    }

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
    private async makeRequest(
        method: "get" | "post" | "patch" | "delete",
        url: string,
        data?: any,
        params?: any,
        headers?: any,
        retry = 0
    ): Promise<any> {
        try {
            const response = await this.axiosInstance.request({
                method,
                url,
                data,
                params,
                headers: headers || this.getHeaders(),
            });

            const jsonData = response.data;

            if ("error" in jsonData) {
                if (jsonData.error_code === 16 && retry < 3) {
                    await this.refreshAccessToken();
                    return this.makeRequest(method, url, data, params, headers, ++retry);
                } else {
                    throw new PikpakException(jsonData.error_description);
                }
            }

            return jsonData;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const errorData = error.response?.data;
                if (errorData && errorData.error_description) {
                    throw new PikpakException(errorData.error_description);
                }
                throw new PikpakException(error.message);
            } else {
                throw error;
            }
        }
    }

    /**
     * 发送 GET 请求
     * @param url - 请求 URL
     * @param params - URL 查询参数
     * @returns API 响应的 JSON 数据
     */
    private async requestGet(url: string, params?: any): Promise<any> {
        return this.makeRequest("get", url, undefined, params);
    }

    /**
     * 发送 POST 请求
     * @param url - 请求 URL
     * @param data - 请求体数据
     * @param headers - 自定义请求头
     * @returns API 响应的 JSON 数据
     */
    private async requestPost(
        url: string,
        data?: any,
        headers?: any
    ): Promise<any> {
        return this.makeRequest("post", url, data, undefined, headers);
    }

    /**
     * 发送 PATCH 请求
     * @param url - 请求 URL
     * @param data - 请求体数据
     * @returns API 响应的 JSON 数据
     */
    private async requestPatch(url: string, data?: any): Promise<any> {
        return this.makeRequest("patch", url, data);
    }

    /**
     * 发送 DELETE 请求
     * @param url - 请求 URL
     * @param params - URL 查询参数
     * @param data - 请求体数据
     * @returns API 响应的 JSON 数据
     */
    private async requestDelete(
        url: string,
        params?: any,
        data?: any
    ): Promise<any> {
        return this.makeRequest("delete", url, data, params);
    }

    /**
     * 解码 Base64 编码的令牌字符串，解析出 access_token 和 refresh_token
     * @throws {PikpakException} 令牌字符串无效时抛出
     */
    private decodeToken(): void {
        try {
            const decodedData: TokenData = JSON.parse(
                atob(this.encodedToken as string)
            );
            this.accessToken = decodedData.access_token;
            this.refreshToken = decodedData.refresh_token;
        } catch (error) {
            throw new PikpakException("无效的已编码令牌字符串");
        }
    }

    /**
     * 将当前 access_token 和 refresh_token 编码为 Base64 字符串
     */
    private encodeToken(): void {
        const tokenData: TokenData = {
            access_token: this.accessToken as string,
            refresh_token: this.refreshToken as string,
        };
        this.encodedToken = btoa(JSON.stringify(tokenData));
    }
    /**
     * 初始化验证码
     * @returns Promise<any> 包含初始化结果的 Promise
     */
    async captchaInit(): Promise<any> {
        const url = `https://${PikpakApi.PIKPAK_USER_HOST}/v1/shield/captcha/init`;
        const params = {
            client_id: PikpakApi.CLIENT_ID,
            action: "POST:/v1/auth/signin",
            device_id: this.deviceId,
            meta: { email: this.username },
        };
        const result = await this.requestPost(url, params);
        if (result && result.captcha_token) {
            this.captchaToken = result.captcha_token;
        }
        return result;
    }

    /**
     * 使用用户名和密码登录 Pikpak
     * @returns 无返回值
     * @throws {PikpakException} 登录失败时抛出
     */
    async login(): Promise<void> {
        const loginUrl = `https://${PikpakApi.PIKPAK_USER_HOST}/v1/auth/signin`;

        if (!this.captchaToken) {
            await this.captchaInit();
        }

        const loginData: Record<string, string> = {
            client_id: PikpakApi.CLIENT_ID,
            client_secret: PikpakApi.CLIENT_SECRET,
            password: this.password as string,
            username: this.username as string,
        };

        if (this.captchaToken) {
            loginData.captcha_token = this.captchaToken;
        }

        try {
            const userInfo = await this.requestPost(loginUrl, loginData, {
                "Content-Type": "application/json",
            });
            this.accessToken = userInfo.access_token;
            this.refreshToken = userInfo.refresh_token;
            this.userId = userInfo.sub;
            this.encodeToken();
        } catch (error: any) {
            const errorMsg = error?.message || "登录失败，请检查用户名和密码";
            throw new PikpakException(errorMsg);
        }
    }

    /**
     * 刷新访问令牌
     * @returns 无返回值
     * @throws {PikpakException} 刷新令牌失败时抛出
     */
    async refreshAccessToken(): Promise<void> {
        const refreshUrl = `https://${PikpakApi.PIKPAK_USER_HOST}/v1/auth/token`;
        const refreshData = {
            client_id: PikpakApi.CLIENT_ID,
            refresh_token: this.refreshToken,
            grant_type: "refresh_token",
        };

        try {
            const userInfo = await this.requestPost(refreshUrl, refreshData);
            this.accessToken = userInfo.access_token;
            this.refreshToken = userInfo.refresh_token;
            this.userId = userInfo.sub;
            this.encodeToken();
        } catch (error) {
            throw new PikpakException("刷新访问令牌失败");
        }
    }

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
    } {
        return {
            username: this.username,
            userId: this.userId,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            encodedToken: this.encodedToken,
        };
    }

    /**
     * 创建文件夹
     * @param name 文件夹名称，默认为 "新建文件夹"
     * @param parentId 父文件夹 ID，默认为根目录
     * @returns Promise<any> 包含创建结果的 Promise
     */
    async createFolder(name: string = "新建文件夹", parentId?: string): Promise<any> {
        const url = `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files`;
        const data = {
            kind: "drive#folder",
            name: name,
            parent_id: parentId,
        };
        const result = await this.requestPost(url, data);
        return result;
    }

    /**
     * 将文件或文件夹移动到回收站
     * @param ids 要移动到回收站的文件或文件夹 ID 列表
     * @returns Promise<any> 包含操作结果的 Promise
     */
    async deleteToTrash(ids: string[]): Promise<any> {
        const url = `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files:batchTrash`;
        const data = {
            ids,
        };
        const result = await this.requestPost(url, data);
        return result;
    }

    /**
     * 将文件或文件夹移出回收站
     * @param ids 要移出回收站的文件或文件夹 ID 列表
     * @returns Promise<any> 包含操作结果的 Promise
     */
    async untrash(ids: string[]): Promise<any> {
        const url = `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files:batchUntrash`;
        const data = {
            ids,
        };
        const result = await this.requestPost(url, data);
        return result;
    }

    /**
     * 永久删除文件或文件夹
     * @param ids 要永久删除的文件或文件夹 ID 列表
     * @returns Promise<any> 包含操作结果的 Promise
     */
    async deleteForever(ids: string[]): Promise<any> {
        const url = `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files:batchDelete`;
        const data = {
            ids,
        };
        const result = await this.requestPost(url, data);
        return result;
    }

    /**
     * 离线下载文件
     * @param fileUrl 文件链接
     * @param parentId 父文件夹 ID，不传默认存储到 My Pack
     * @param name 文件名，不传默认为文件链接的文件名
     * @returns Promise<any> 包含操作结果的 Promise
     */
    async offlineDownload(
        fileUrl: string,
        parentId?: string,
        name?: string
    ): Promise<any> {
        const url = `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files`;
        const downloadData = {
            kind: 'drive#file',
            name: name,
            upload_type: 'UPLOAD_TYPE_URL',
            url: { url: fileUrl },
            folder_type: parentId ? '' : 'DOWNLOAD',
            parent_id: parentId,
        };
        const result = await this.requestPost(url, downloadData);
        return result;
    }

    /**
     * 获取离线下载列表
     * @param size 每次请求的数量，默认为 10000
     * @param nextPageToken 下一页的 page token
     * @param phase 离线下载任务状态，默认为 ["PHASE_TYPE_RUNNING", "PHASE_TYPE_ERROR"]
     *   支持的值：PHASE_TYPE_RUNNING, PHASE_TYPE_ERROR, PHASE_TYPE_COMPLETE, PHASE_TYPE_PENDING
     * @returns {Promise<TaskListResponse>} 包含任务列表的响应
     */
    async offlineList(
        size = 10000,
        nextPageToken?: string,
        phase: string[] = ['PHASE_TYPE_RUNNING', 'PHASE_TYPE_ERROR']
    ): Promise<TaskListResponse> {
        const url = `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/tasks`;
        const data = {
            type: 'offline',
            thumbnail_size: 'SIZE_SMALL',
            limit: size,
            page_token: nextPageToken,
            filters: JSON.stringify({ phase: { in: phase.join(',') } }),
            with: 'reference_resource',
        };
        const result = await this.requestGet(url, data);
        return result;
    }

    /**
     * 获取离线下载任务状态
     * @param taskId 离线下载任务 ID
     * @param fileId 离线下载文件 ID
     * @returns Promise<DownloadStatus> 表示下载状态的 Promise
     */
    async getTaskStatus(taskId: string, fileId: string): Promise<DownloadStatus> {
        try {
            const infos = await this.offlineList();
            if (infos && infos.tasks) {
                for (const task of infos.tasks) {
                    if (taskId === task.id) {
                        return DownloadStatus.Downloading;
                    }
                }
            }
            const fileInfo = await this.offlineFileInfo(fileId);
            if (fileInfo) {
                return DownloadStatus.Done;
            } else {
                return DownloadStatus.NotFound;
            }
        } catch (error) {
            return DownloadStatus.Error;
        }
    }

    /**
     * 获取离线下载文件信息
     * @param fileId 离线下载文件 ID
     * @returns Promise<any> 包含操作结果的 Promise
     */
    async offlineFileInfo(fileId: string): Promise<any> {
        const url = `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files/${fileId}`;
        const result = await this.requestGet(url, { thumbnail_size: 'SIZE_LARGE' });
        return result;
    }

    /**
     * 获取文件列表
     * @param size 每次请求的数量，默认为 所有
     * @param parentId 父文件夹 ID，默认为 根目录
     * @param nextPageToken 下一页的分页令牌
     * @param additionalFilters 额外的过滤条件
     * @returns Promise<FileList> 包含文件列表的 Promise
     */
    async fileList(
        size = 0,
        parentId?: string,
        nextPageToken?: string,
        additionalFilters?: Record<string, any>
    ): Promise<FileList> {
        const defaultFilters = {
            trashed: { eq: false },
            phase: { eq: "PHASE_TYPE_COMPLETE" },
        };
        const filters = { ...defaultFilters, ...additionalFilters };

        const listUrl = `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files`;
        const listData = {
            parent_id: parentId,
            thumbnail_size: "SIZE_MEDIUM",
            limit: size,
            with_audit: "true",
            page_token: nextPageToken,
            filters: JSON.stringify(filters),
        };

        return this.requestGet(listUrl, listData);
    }

    /**
     * 获取最近添加事件列表
     * @param size 每次请求的数量，默认为 100，设置为 0 则请求所有
     * @param nextPageToken 下一页的 page token
     * @returns {Promise<EventsResponse>} 包含事件列表的响应
     */
    async events(size = 100, nextPageToken?: string): Promise<EventsResponse> {
        const url = `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/events`;
        const data = {
            thumbnail_size: 'SIZE_MEDIUM',
            limit: size,
            next_page_token: nextPageToken,
        };
        const result = await this.requestGet(url, data);
        return result;
    }

    /**
     * 重试离线下载任务
     * @param taskId 离线下载任务 ID
     * @returns Promise<any> 包含操作结果的 Promise
     * @throws {PikpakException} 重试离线下载任务失败时抛出异常
     */
    async offlineTaskRetry(taskId: string): Promise<any> {
        const url = `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/task`;
        const data = {
            type: 'offline',
            create_type: 'RETRY',
            id: taskId,
        };
        try {
            const result = await this.requestPost(url, data);
            return result;
        } catch (error) {
            throw new PikpakException(`重试离线下载任务失败: ${taskId}. ${error}`);
        }
    }

    /**
     * 根据任务 ID 删除任务
     * @param taskIds 要删除的任务 ID 列表
     * @param deleteFiles 是否同时删除文件，默认为 false
     * @returns Promise<void> 表示操作完成的 Promise
     * @throws {PikpakException} 删除任务失败时抛出异常
     */
    async deleteTasks(taskIds: string[], deleteFiles = false): Promise<void> {
        const url = `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/tasks`;
        const params = {
            task_ids: taskIds,
            delete_files: deleteFiles,
        };
        try {
            await this.requestDelete(url, params);
        } catch (error) {
            throw new PikpakException(`删除任务失败: ${taskIds}. ${error}`);
        }
    }



    /**
     * 将形如 /path/a/b 的路径转换为 文件夹的id
     * @param path 路径字符串
     * @param create 是否创建不存在的文件夹
     * @returns 文件夹 ID 列表
     */
    async pathToId(path: string, create = false): Promise<FileRecord[]> {
        if (!path || path.length <= 0) {
            return [];
        }

        const paths = path.split("/").filter((p) => p.trim().length > 0);

        // 构造不同级别的path表达式，尝试找到距离目标最近的那一层
        const multiLevelPaths = paths.map(
            (_, i) => `/${paths.slice(0, i + 1).join("/")}`
        );
        let pathIds: FileRecord[] = multiLevelPaths
            .filter((p) => p in this.pathIdCache)
            .map((p) => this.pathIdCache[p]);

        // 判断缓存命中情况
        const hitCount = pathIds.length;

        if (hitCount === paths.length) {
            return pathIds;
        }

        let count = hitCount;
        let parentId: string | undefined = hitCount > 0 ? pathIds[hitCount - 1].id : undefined;
        let nextPageToken: string | undefined = undefined;

        while (count < paths.length) {
            const currentParentPath = `/${paths.slice(0, count).join("/")}`;
            const data = await this.fileList(0, parentId, nextPageToken);

            let recordOfTargetPath: FileRecord | undefined;

            for (const f of data.files) {
                const currentPath = `/${paths.slice(0, count).concat([f.name]).join("/")}`;
                const fileType = f.kind.includes("folder") ? "folder" : "file";
                const record: FileRecord = {
                    id: f.id,
                    name: f.name,
                    fileType,
                };

                this.pathIdCache[currentPath] = record;

                if (f.name === paths[count]) {
                    recordOfTargetPath = record;
                    // 不break: 剩下的文件也同样缓存起来
                }
            }

            if (recordOfTargetPath) {
                pathIds.push(recordOfTargetPath);
                count++;
                parentId = recordOfTargetPath.id;
            } else if (
                data.next_page_token &&
                (!nextPageToken || nextPageToken !== data.next_page_token)
            ) {
                nextPageToken = data.next_page_token;
            } else if (create) {
                try {
                    const createResult = await this.createFolder(paths[count], parentId);
                    const id = createResult.file.id;
                    const record: FileRecord = {
                        id,
                        name: paths[count],
                        fileType: "folder",
                    };

                    pathIds.push(record);
                    const currentPath = `/${paths.slice(0, count + 1).join("/")}`;
                    this.pathIdCache[currentPath] = record;
                    count++;
                    parentId = id;
                } catch (error) {
                    console.error(`创建文件夹 ${paths[count]} 失败:`, error);
                    break;
                }
            } else {
                break;
            }
        }

        return pathIds;
    }

    /**
     * 批量移动文件
     * @param ids 文件 ID 列表
     * @param toParentId 目标文件夹 ID，默认为根目录
     * @returns  API 响应数据
     */
    async fileBatchMove(
        ids: string[],
        toParentId?: string
    ): Promise<Record<string, any>> {
        const to = toParentId ? { parent_id: toParentId } : {};
        const result = await this.requestPost(
            `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files:batchMove`,
            {
                ids,
                to,
            }
        );
        return result;
    }

    /**
     * 批量复制文件
     * @param ids 文件 ID 列表
     * @param toParentId 目标文件夹 ID，默认为根目录
     * @returns Pikpak API 返回的结果
     */
    async fileBatchCopy(
        ids: string[],
        toParentId?: string
    ): Promise<Record<string, any>> {
        const to = toParentId ? { parent_id: toParentId } : {};

        const result = await this.requestPost(
            `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files:batchCopy`,
            {
                ids,
                to,
            }
        );

        return result;
    }

    /**
     * 根据路径移动或复制文件
     * @param fromPaths 要移动或复制的文件路径列表
     * @param toPath 移动或复制到的路径
     * @param move 是否移动，默认为复制
     * @param create 是否创建不存在的文件夹，默认为 false
     * @returns Pikpak API 返回的结果
     */
    async fileMoveOrCopyByPath(
        fromPaths: string[],
        toPath: string,
        move = false,
        create = false
    ): Promise<any> {
        const fromIds: string[] = [];
        for (const path of fromPaths) {
            const pathIds = await this.pathToId(path);
            if (pathIds.length > 0) {
                const lastPathId = pathIds[pathIds.length - 1];
                if (lastPathId.id) {
                    fromIds.push(lastPathId.id);
                }
            }
        }

        if (fromIds.length === 0) {
            throw new PikpakException("要移动或复制的文件不存在");
        }

        const toPathIds = await this.pathToId(toPath, create);
        const toParentId = toPathIds.length > 0 ? toPathIds[toPathIds.length - 1].id : undefined;

        if (move) {
            return this.fileBatchMove(fromIds, toParentId);
        } else {
            return this.fileBatchCopy(fromIds, toParentId);
        }
    }

    /**
     * 获取文件的下载链接
     * @param fileId 文件 ID
     * @returns 包含文件详细信息的对象
     * 
     *  - 使用 `medias[0].link.url` 在流媒体服务或工具中以高速流式传输。
     *  - 使用 `web_content_link` 下载文件。
     */
    async getDownloadUrl(fileId: string): Promise<any> {
        const result = await this.requestGet(
            `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files/${fileId}?_magic=2021&thumbnail_size=SIZE_LARGE`
        );
        return result;
    }

    /**
     * 重命名文件
     * @param id - 文件 ID
     * @param newFileName - 新的文件名
     * @returns 更新后的文件信息
     * @throws {PikpakException} 文件重命名失败时抛出
     */
    async fileRename(id: string, newFileName: string): Promise<any> {
        const data = {
            name: newFileName,
        };

        try {
            const result = await this.requestPatch(
                `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files/${id}`,
                data
            );
            return result;
        } catch (error) {
            throw new PikpakException("文件重命名失败");
        }
    }

    /**
     * 批量给文件加星标
     * @param ids 文件 ID 列表
     * @returns Pikpak API 返回的结果
     */
    async fileBatchStar(ids: string[]): Promise<any> {
        const data = {
            ids,
        };
        const result = await this.requestPost(
            `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files:star`,
            data
        );
        return result;
    }

    /**
     * 批量取消文件星标
     * @param ids 文件 ID 列表
     * @returns Pikpak API 返回的结果
     */
    async fileBatchUnstar(ids: string[]): Promise<any> {
        const data = {
            ids,
        };
        const result = await this.requestPost(
            `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/files:unstar`,
            data
        );
        return result;
    }

    /**
     * 获取已加星标的文件列表
     * @param size 每次请求的数量，默认为 100
     * @param nextPageToken 下一页的分页令牌，用于获取更多结果
     * @returns Pikpak API 返回的结果，包含已加星标的文件列表
     */
    async fileStarList(
        size = 100,
        nextPageToken?: string
    ): Promise<any> {
        const additionalFilters = { system_tag: { in: "STAR" } };
        const result = await this.fileList(
            size,
            "*",
            nextPageToken,
            additionalFilters
        );
        return result;
    }

    /**
     * 批量分享文件
     * @param ids 文件 ID 列表
     * @param needPassword 是否需要分享密码，默认为 false
     * @param expirationDays 分享链接的有效天数，默认为 -1（永久有效）
     * @returns Pikpak API 返回的结果，包含分享链接信息
     */
    async fileBatchShare(
        ids: string[],
        needPassword = false,
        expirationDays = -1
    ): Promise<any> {
        const data = {
            file_ids: ids,
            share_to: needPassword ? "encryptedlink" : "publiclink",
            expiration_days: expirationDays,
            pass_code_option: needPassword ? "REQUIRED" : "NOT_REQUIRED",
        };
        const result = await this.requestPost(
            `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/share`,
            data
        );
        return result;
    }

    /**
     * 获取当前用户的空间配额信息
     * @returns {Promise<AboutResponse>} 包含空间配额和用量的响应
     */
    async getQuotaInfo(): Promise<AboutResponse> {
        const result = await this.requestGet(
            `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/about`
        );
        return result;
    }

    /**
     * 获取邀请码
     * @returns {Promise<string>} 邀请码字符串
     */
    async getInviteCode(): Promise<string> {
        const result = await this.requestGet(
            `https://${PikpakApi.PIKPAK_API_HOST}/vip/v1/activity/inviteCode`
        );
        return result["code"];
    }

    /**
     * 获取 VIP 信息
     * @returns {Promise<VipResponse>} 包含 VIP 类型、过期时间等信息的响应
     */
    async getVipInfo(): Promise<VipResponse> {
        const result = await this.requestGet(
            `https://${PikpakApi.PIKPAK_API_HOST}/drive/v1/privilege/vip`
        );
        return result;
    }

    /**
     * 获取传输配额信息
     * @returns {Promise<TransferQuotaResponse>} 包含离线下载、上传、下载等传输配额信息的响应
     */
    async getTransferQuota(): Promise<TransferQuotaResponse> {
        const url = `https://${PikpakApi.PIKPAK_API_HOST}/vip/v1/quantity/list?type=transfer`;
        const result = await this.requestGet(url);
        return result;
    }

    /**
     * 设置设备 ID
     * @param deviceId 设备 ID
     */
    setDeviceId(deviceId: string): void {
        this.deviceId = deviceId;
    }

}
