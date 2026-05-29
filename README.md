# PikpakAPI

基于 [Muione/PikpakAPI](https://github.com/Muione/PikpakAPI) 的 fork 版本。原项目已两年未更新，Pikpak 登录 API 已变更导致无法登录。此仓库修复了认证流程。

- **修复**：使用新端点 `/v1/auth/signin`，增加验证码（captcha）支持
- **状态**：API 层面可正常登录，其他功能沿用原实现

## 安装

```bash
npm install pikpakapi
```

## 快速开始

```typescript
import { PikpakApi } from "pikpakapi";

const api = new PikpakApi("your-username", "your-password");
await api.login();

const files = await api.fileList();
console.log(files);
```

### 使用已编码令牌（避免每次登录）

```typescript
import { PikpakApi } from "pikpakapi";

const api = new PikpakApi("your-username", "your-password");
await api.login();
const { encodedToken } = api.getUserInfo();

// 下次直接使用令牌初始化
const api2 = new PikpakApi(undefined, undefined, encodedToken);
const files = await api2.fileList();
```

### 设置自定义设备 ID

```typescript
const api = new PikpakApi("your-username", "your-password");
api.setDeviceId("CUSTOM_DEVICE_ID_123");
await api.login();
```

## API 参考

### 认证

| 方法 | 说明 |
|---|---|
| `login()` | 使用用户名和密码登录（自动处理验证码） |
| `captchaInit()` | 手动初始化验证码 |
| `refreshAccessToken()` | 刷新访问令牌 |
| `getUserInfo()` | 获取用户信息（含 accessToken / refreshToken / encodedToken） |

### 文件操作

| 方法 | 说明 |
|---|---|
| `fileList(size?, parentId?, nextPageToken?, additionalFilters?)` | 获取文件列表 |
| `createFolder(name?, parentId?)` | 创建文件夹 |
| `fileRename(id, newFileName)` | 重命名文件 |
| `fileBatchMove(ids, toParentId?)` | 批量移动文件 |
| `fileBatchCopy(ids, toParentId?)` | 批量复制文件 |
| `fileMoveOrCopyByPath(fromPaths, toPath, move?, create?)` | 按路径移动/复制文件 |
| `deleteToTrash(ids)` | 移到回收站 |
| `untrash(ids)` | 移出回收站 |
| `deleteForever(ids)` | 永久删除 |
| `pathToId(path, create?)` | 路径转文件夹 ID |
| `getDownloadUrl(fileId)` | 获取文件下载链接 |

### 离线下载

| 方法 | 说明 |
|---|---|
| `offlineDownload(fileUrl, parentId?, name?)` | 发起离线下载 |
| `offlineList(size?, nextPageToken?, phase?)` | 获取离线下载列表 |
| `getTaskStatus(taskId, fileId)` | 获取任务状态 |
| `offlineFileInfo(fileId)` | 获取离线文件信息 |
| `offlineTaskRetry(taskId)` | 重试离线任务 |
| `deleteTasks(taskIds, deleteFiles?)` | 删除任务 |

### 标记与分享

| 方法 | 说明 |
|---|---|
| `fileBatchStar(ids)` | 批量加星标 |
| `fileBatchUnstar(ids)` | 批量取消星标 |
| `fileStarList(size?, nextPageToken?)` | 获取星标文件列表 |
| `fileBatchShare(ids, needPassword?, expirationDays?)` | 批量分享文件 |

### 账户信息

| 方法 | 说明 |
|---|---|
| `getQuotaInfo()` | 获取空间配额 |
| `getVipInfo()` | 获取 VIP 信息 |
| `getInviteCode()` | 获取邀请码 |
| `getTransferQuota()` | 获取传输配额 |
| `events(size?, nextPageToken?)` | 获取最近事件 |

### 其他

| 方法 | 说明 |
|---|---|
| `setDeviceId(deviceId)` | 设置设备 ID |

## 修复说明

原项目基于旧版 Pikpak API，以下接口已过期并修复：

| 改动 | 说明 |
|---|---|
| 登录端点 | `/v1/auth/token` → `/v1/auth/signin` |
| 登录参数 | 移除 `grant_type: "password"`，新增 `captcha_token` |
| 验证码流程 | 登录前自动调用 `captchaInit()` 获取 `captcha_token` |
| 请求头 | 新增 `X-Device-Id` 和 `X-Captcha-Token` |
| Content-Type | 登录请求改为 `application/json` |
| 错误信息 | 提取服务端 `error_description`，不再返回笼统消息 |

## License

AGPL-3.0
