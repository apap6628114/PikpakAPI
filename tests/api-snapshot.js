/**
 * Pikpak API 快照测试工具
 *
 * 功能：
 * 1. 测试所有安全的读操作，记录原始 HTTP 请求/响应
 * 2. 在安全测试文件夹中测试写操作
 * 3. 结构化保存数据到 tests/data/，供后续 AI 对比 API 变更
 *
 * 使用方式：
 *   node tests/api-snapshot.js
 *
 * 前置条件：
 *   - 项目根目录下存在 .pikpak-token.json（包含有效的 access_token）
 */

// ============================================================
// 1. 模块加载
// ============================================================
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// ============================================================
// 2. 配置
// ============================================================
const CONFIG = {
  // 凭证文件路径（相对项目根目录）
  TOKEN_FILE: path.join(__dirname, "..", ".pikpak-token.json"),
  // 测试数据输出目录
  DATA_DIR: path.join(__dirname, "data"),
  // 安全测试文件夹名称（在云盘根目录创建）
  TEST_FOLDER_NAME: "__pikpak_api_safe_test__",
  // 每次请求的超时时间（毫秒）
  TIMEOUT_MS: 30000,
};

// 从 PikpakApi 源码中复用的常量
const API_CONFIG = {
  HOST: "api-drive.mypikpak.com",
  DEVICE_ID: "01J0NP4CPJR3R9XHGZZKTCFAET",
  USER_AGENT:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
};

// ============================================================
// 3. 辅助函数
// ============================================================

/**
 * 将 API 名称转为安全的文件名
 * @param {string} name
 * @returns {string}
 */
function safeFileName(name) {
  return name.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_");
}

/**
 * 从 JSON 对象中递归提取字段 schema（字段路径 → 类型 + 示例值）
 *
 * @param {*} obj - 要提取 schema 的 JSON 对象
 * @param {string} prefix - 内部递归用的路径前缀
 * @returns {Record<string, {type: string, example: any}>}
 */
function extractSchema(obj, prefix = "") {
  const schema = {};

  if (obj === null || obj === undefined) {
    return schema;
  }

  if (Array.isArray(obj)) {
    // 数组类型：标注为 array，提取第一个元素的 schema 作为代表
    schema[prefix || "[]"] = { type: "array", example: obj.length > 0 ? obj[0] : [] };
    if (obj.length > 0 && typeof obj[0] === "object" && obj[0] !== null) {
      Object.assign(schema, extractSchema(obj[0], prefix ? `${prefix}[].` : "[]."));
    }
    return schema;
  }

  if (typeof obj !== "object") {
    // 基本类型
    schema[prefix] = { type: typeof obj, example: obj };
    return schema;
  }

  // 对象：递归处理每个字段
  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      // 嵌套对象：递归
      schema[fieldPath] = { type: "object", example: value };
      Object.assign(schema, extractSchema(value, fieldPath));
    } else if (Array.isArray(value)) {
      // 数组
      schema[fieldPath] = { type: "array", example: value.length > 0 ? value[0] : [] };
      if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        Object.assign(schema, extractSchema(value[0], `${fieldPath}[].`));
      }
    } else {
      // 基本类型或 null
      schema[fieldPath] = {
        type: value === null ? "null" : typeof value,
        example: value,
      };
    }
  }

  return schema;
}

/**
 * 构造通用请求头
 * @param {string} accessToken
 * @returns {Record<string, string>}
 */
function buildHeaders(accessToken) {
  return {
    "User-Agent": API_CONFIG.USER_AGENT,
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Bearer ${accessToken}`,
    "X-Device-Id": API_CONFIG.DEVICE_ID,
  };
}

/**
 * 安全地读取 .pikpak-token.json
 * @returns {{ access_token: string, refresh_token: string, username: string, userId: string, createdAt: number }}
 */
function loadToken() {
  if (!fs.existsSync(CONFIG.TOKEN_FILE)) {
    console.error("❌ 未找到凭证文件: .pikpak-token.json");
    console.error("   请先登录以生成凭证文件，或手动放置有效的 token 文件");
    process.exit(1);
  }

  const raw = fs.readFileSync(CONFIG.TOKEN_FILE, "utf-8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error("❌ 凭证文件格式错误，不是有效的 JSON");
    process.exit(1);
  }

  if (!data.access_token) {
    console.error("❌ 凭证文件中缺少 access_token");
    process.exit(1);
  }

  return data;
}

/**
 * 确保 data 输出目录存在
 */
function ensureDataDir() {
  if (!fs.existsSync(CONFIG.DATA_DIR)) {
    fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
  }
}

// ============================================================
// 4. 核心：单个 API 测试 + 记录
// ============================================================

/**
 * 测试单个 API 并记录完整的请求/响应/schema
 *
 * @param {object} apiDef - API 定义
 * @param {string} apiDef.name - 测试名称（对应 PikpakApi 方法名）
 * @param {string} apiDef.method - HTTP 方法
 * @param {string} apiDef.url - 完整 URL
 * @param {object} [apiDef.params] - URL 查询参数
 * @param {object} [apiDef.data] - 请求体
 * @param {object} [apiDef.extraHeaders] - 额外的请求头
 * @param {string} accessToken
 * @returns {Promise<object>} 记录对象
 */
async function testAndRecord(apiDef, accessToken) {
  const { name, method, url, params, data: bodyData, extraHeaders = {} } = apiDef;

  const headers = { ...buildHeaders(accessToken), ...extraHeaders };

  // 构造请求配置（用于记录）
  const requestConfig = {
    method: method.toLowerCase(),
    url,
    params,
    data: bodyData,
    headers,
    timeout: CONFIG.TIMEOUT_MS,
    // 不跟随重定向，获取原始响应
    maxRedirects: 0,
    // 记录完整的响应头
    transformResponse: [(rawData) => rawData],
  };

  // ---- 记录请求信息 ----
  const record = {
    api: name,
    endpoint: `${method} ${url}`,
    testedAt: new Date().toISOString(),
    request: {
      method,
      url,
      headers: sanitizeHeaders(headers),
      query: params || null,
      body: bodyData || null,
    },
    response: null,
    schema: null,
    success: false,
    error: null,
  };

  process.stdout.write(`  ▶ ${name.padEnd(24)} `);

  try {
    const startTime = Date.now();
    const response = await axios(requestConfig);
    const elapsed = Date.now() - startTime;

    // 解析响应体（axios 返回的是字符串，因为我们用了 transformResponse）
    let responseBody;
    try {
      responseBody = JSON.parse(response.data);
    } catch {
      responseBody = response.data;
    }

    // ---- 记录响应信息 ----
    record.response = {
      statusCode: response.status,
      statusText: response.statusText,
      elapsed: `${elapsed}ms`,
      headers: sanitizeHeaders(response.headers),
      body: responseBody,
    };

    // ---- 提取 schema ----
    if (responseBody && typeof responseBody === "object") {
      record.schema = extractSchema(responseBody);
    }

    record.success = true;
    console.log(`✅ ${response.status} (${elapsed}ms)`);
  } catch (err) {
    let statusCode = "ERR";
    let responseBody = null;

    if (err.response) {
      statusCode = err.response.status;
      try {
        responseBody = JSON.parse(err.response.data);
      } catch {
        responseBody = err.response.data;
      }

      record.response = {
        statusCode: err.response.status,
        statusText: err.response.statusText,
        headers: sanitizeHeaders(err.response.headers),
        body: responseBody,
      };
    }

    record.error = err.message;
    console.log(`❌ ${statusCode} — ${err.message}`);
  }

  // ---- 保存到文件 ----
  const fileName = `${safeFileName(method)}_${safeFileName(
    url.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "_")
  )}.json`;
  const filePath = path.join(CONFIG.DATA_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(record, null, 2));

  return record;
}

/**
 * 去掉敏感信息（token 类字段脱敏）
 * @param {object} headers
 * @returns {object}
 */
function sanitizeHeaders(headers) {
  const sanitized = { ...headers };
  for (const key of Object.keys(sanitized)) {
    const lower = key.toLowerCase();
    if (lower === "authorization") {
      const val = String(sanitized[key]);
      sanitized[key] = val.length > 20 ? `${val.slice(0, 20)}...` : "(redacted)";
    } else if (lower.includes("token") || lower.includes("cookie") || lower.includes("set-cookie")) {
      sanitized[key] = "(redacted)";
    }
  }
  return sanitized;
}

// ============================================================
// 5. 读操作 API 定义
// ============================================================

const READ_API_LIST = [
  {
    name: "getQuotaInfo",
    method: "GET",
    url: `https://${API_CONFIG.HOST}/drive/v1/about`,
    params: {},
  },
  {
    name: "getVipInfo",
    method: "GET",
    url: `https://${API_CONFIG.HOST}/drive/v1/privilege/vip`,
    params: {},
  },
  {
    name: "getTransferQuota",
    method: "GET",
    url: `https://${API_CONFIG.HOST}/vip/v1/quantity/list`,
    params: { type: "transfer" },
  },
  {
    name: "getInviteCode",
    method: "GET",
    url: `https://${API_CONFIG.HOST}/vip/v1/activity/inviteCode`,
    params: {},
  },
  {
    name: "fileList",
    method: "GET",
    url: `https://${API_CONFIG.HOST}/drive/v1/files`,
    params: {
      thumbnail_size: "SIZE_MEDIUM",
      limit: 10,
      filters: JSON.stringify({
        trashed: { eq: false },
        phase: { eq: "PHASE_TYPE_COMPLETE" },
      }),
    },
  },
  {
    name: "fileStarList",
    method: "GET",
    url: `https://${API_CONFIG.HOST}/drive/v1/files`,
    params: {
      thumbnail_size: "SIZE_MEDIUM",
      limit: 10,
      filters: JSON.stringify({
        trashed: { eq: false },
        phase: { eq: "PHASE_TYPE_COMPLETE" },
        system_tag: { in: "STAR" },
      }),
    },
  },
  {
    name: "events",
    method: "GET",
    url: `https://${API_CONFIG.HOST}/drive/v1/events`,
    params: {
      thumbnail_size: "SIZE_MEDIUM",
      limit: 10,
    },
  },
  {
    name: "offlineList",
    method: "GET",
    url: `https://${API_CONFIG.HOST}/drive/v1/tasks`,
    params: {
      type: "offline",
      thumbnail_size: "SIZE_SMALL",
      limit: 10,
      filters: JSON.stringify({
        phase: { in: "PHASE_TYPE_RUNNING,PHASE_TYPE_ERROR" },
      }),
      with: "reference_resource",
    },
  },
];

// ============================================================
// 6. 写操作测试（在安全测试文件夹中）
// ============================================================

/**
 * 在安全测试文件夹中执行写操作测试
 *
 * 流程：
 *   createFolder (测试根) → createFolder (子文件夹×2) → fileRename →
 *   fileBatchStar → fileBatchUnstar → createFolder (目标子文件夹) →
 *   fileBatchCopy (跨文件夹) → deleteToTrash → untrash → cleanup
 *
 * @param {string} accessToken
 * @returns {Promise<object[]>} 所有写操作的记录数组
 */
async function testWriteOperations(accessToken) {
  console.log("\n═══ 写操作测试 ─── 安全测试文件夹 ═══\n");

  const records = [];
  const ctx = { folderId: null, subFolderIds: [], testFolderId: null };
  const headers = buildHeaders(accessToken);

  /**
   * 执行写操作并记录
   */
  async function writeOp(apiName, method, url, data, params) {
    const record = {
      api: apiName,
      endpoint: `${method} ${url}`,
      testedAt: new Date().toISOString(),
      request: {
        method,
        url,
        headers: sanitizeHeaders(headers),
        body: data || null,
        query: params || null,
      },
      response: null,
      schema: null,
      success: false,
      error: null,
      operation: apiName,
    };

    process.stdout.write(`  ▶ ${apiName.padEnd(24)} `);

    try {
      const response = await axios({
        method: method.toLowerCase(),
        url,
        data,
        params,
        headers,
        timeout: CONFIG.TIMEOUT_MS,
        transformResponse: [(r) => r],
      });

      let responseBody;
      try {
        responseBody = JSON.parse(response.data);
      } catch {
        responseBody = response.data;
      }

      record.response = {
        statusCode: response.status,
        statusText: response.statusText,
        headers: sanitizeHeaders(response.headers),
        body: responseBody,
      };

      if (responseBody && typeof responseBody === "object") {
        record.schema = extractSchema(responseBody);
      }

      record.success = true;
      console.log(`✅ ${response.status}`);

      // 提取文件夹 ID 供后续操作使用
      if (responseBody?.file?.id) {
        ctx.folderId = responseBody.file.id;
      }
    } catch (err) {
      let statusCode = "ERR";
      if (err.response) {
        statusCode = err.response.status;
        try {
          record.response = {
            statusCode: err.response.status,
            statusText: err.response.statusText,
            headers: sanitizeHeaders(err.response.headers),
            body: JSON.parse(err.response.data),
          };
        } catch {
          record.response = {
            statusCode: err.response.status,
            body: err.response.data,
          };
        }
      }
      record.error = err.message;
      console.log(`❌ ${statusCode} — ${err.message}`);
    }

    // 保存到文件
    const fileName = `${safeFileName(method)}_write_${safeFileName(apiName)}.json`;
    const filePath = path.join(CONFIG.DATA_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2));

    records.push(record);
    return record;
  }

  // ================================================================
  // 步骤 1: 创建测试根文件夹
  // ================================================================
  let rootRes = await writeOp(
    "createFolder_root",
    "POST",
    `https://${API_CONFIG.HOST}/drive/v1/files`,
    {
      kind: "drive#folder",
      name: CONFIG.TEST_FOLDER_NAME,
      parent_id: undefined,
    }
  );

  const rootFolderId = rootRes.response?.body?.file?.id;
  if (!rootFolderId) {
    console.log("\n⚠️  创建测试文件夹失败，跳过后续写操作测试");
    return records;
  }
  ctx.testFolderId = rootFolderId;
  console.log(`  📁 测试文件夹 ID: ${rootFolderId}`);

  // ================================================================
  // 步骤 2: 在测试文件夹下创建子文件夹 sub_a
  // ================================================================
  await writeOp(
    "createFolder_sub_a",
    "POST",
    `https://${API_CONFIG.HOST}/drive/v1/files`,
    {
      kind: "drive#folder",
      name: "sub_a",
      parent_id: rootFolderId,
    }
  );
  const subAId = ctx.folderId;
  if (subAId) ctx.subFolderIds.push(subAId);

  // ================================================================
  // 步骤 3: 创建子文件夹 sub_b
  // ================================================================
  await writeOp(
    "createFolder_sub_b",
    "POST",
    `https://${API_CONFIG.HOST}/drive/v1/files`,
    {
      kind: "drive#folder",
      name: "sub_b",
      parent_id: rootFolderId,
    }
  );
  const subBId = ctx.folderId;
  if (subBId) ctx.subFolderIds.push(subBId);

  // ================================================================
  // 步骤 4: 重命名 sub_a → sub_a_renamed
  // ================================================================
  if (subAId) {
    await writeOp(
      "fileRename",
      "PATCH",
      `https://${API_CONFIG.HOST}/drive/v1/files/${subAId}`,
      { name: "sub_a_renamed" }
    );
  }

  // ================================================================
  // 步骤 5: 给 sub_b 加星标
  // ================================================================
  if (subBId) {
    await writeOp(
      "fileBatchStar",
      "POST",
      `https://${API_CONFIG.HOST}/drive/v1/files:star`,
      { ids: [subBId] }
    );
  }

  // ================================================================
  // 步骤 6: 给 sub_b 取消星标
  // ================================================================
  if (subBId) {
    await writeOp(
      "fileBatchUnstar",
      "POST",
      `https://${API_CONFIG.HOST}/drive/v1/files:unstar`,
      { ids: [subBId] }
    );
  }

  // ================================================================
  // 步骤 7: 创建目标子文件夹 sub_target（作为复制目标）
  // ================================================================
  let subTargetId = null;
  await writeOp(
    "createFolder_sub_target",
    "POST",
    `https://${API_CONFIG.HOST}/drive/v1/files`,
    {
      kind: "drive#folder",
      name: "sub_target",
      parent_id: rootFolderId,
    }
  );
  subTargetId = ctx.folderId;
  if (subTargetId) ctx.subFolderIds.push(subTargetId);

  // ================================================================
  // 步骤 8: 复制 sub_b 到 sub_target（跨文件夹复制）
  // ================================================================
  if (subBId && subTargetId) {
    await writeOp(
      "fileBatchCopy",
      "POST",
      `https://${API_CONFIG.HOST}/drive/v1/files:batchCopy`,
      {
        ids: [subBId],
        to: { parent_id: subTargetId },
      }
    );
  }

  // ================================================================
  // 步骤 9: 将 sub_b 移到回收站
  // ================================================================
  if (subBId) {
    await writeOp(
      "deleteToTrash",
      "POST",
      `https://${API_CONFIG.HOST}/drive/v1/files:batchTrash`,
      { ids: [subBId] }
    );
  }

  // ================================================================
  // 步骤 10: 将 sub_b 从回收站恢复
  // ================================================================
  if (subBId) {
    await writeOp(
      "untrash",
      "POST",
      `https://${API_CONFIG.HOST}/drive/v1/files:batchUntrash`,
      { ids: [subBId] }
    );
  }

  // ================================================================
  // 步骤 11: 清理 — 将整个测试文件夹移到回收站
  // ================================================================
  console.log("\n  🧹 清理：将测试文件夹移到回收站...");
  await writeOp(
    "cleanup_trash_test_folder",
    "POST",
    `https://${API_CONFIG.HOST}/drive/v1/files:batchTrash`,
    { ids: [rootFolderId] }
  );

  return records;
}

// ============================================================
// 7. 汇总生成
// ============================================================

/**
 * 生成测试汇总文件
 * @param {object} tokenInfo
 * @param {object[]} readRecords
 * @param {object[]} writeRecords
 */
function generateSummary(tokenInfo, readRecords, writeRecords) {
  const readSuccess = readRecords.filter((r) => r.success).length;
  const readFail = readRecords.filter((r) => !r.success).length;
  const writeSuccess = writeRecords.filter((r) => r.success).length;
  const writeFail = writeRecords.filter((r) => !r.success).length;

  const summary = {
    testTime: new Date().toISOString(),
    account: {
      username: tokenInfo.username,
      userId: tokenInfo.userId,
    },
    summary: {
      total: readRecords.length + writeRecords.length,
      passed: readSuccess + writeSuccess,
      failed: readFail + writeFail,
      readAPIs: { total: readRecords.length, passed: readSuccess, failed: readFail },
      writeAPIs: { total: writeRecords.length, passed: writeSuccess, failed: writeFail },
    },
    apiList: [
      ...readRecords.map((r) => ({
        name: r.api,
        endpoint: r.endpoint,
        success: r.success,
        statusCode: r.response?.statusCode || null,
        error: r.error,
        dataFile: `${safeFileName(r.request.method)}_${safeFileName(
          r.endpoint.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "_")
        )}.json`,
      })),
      ...writeRecords.map((r) => ({
        name: r.api,
        endpoint: r.endpoint,
        success: r.success,
        statusCode: r.response?.statusCode || null,
        error: r.error,
        operation: r.operation,
        dataFile: `${safeFileName(r.request.method)}_write_${safeFileName(r.api)}.json`,
      })),
    ],
    dataDir: CONFIG.DATA_DIR,
  };

  const summaryPath = path.join(CONFIG.DATA_DIR, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  return summary;
}

// ============================================================
// 8. 主流程
// ============================================================

async function main() {
  console.log("");
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║        Pikpak API 快照测试工具                          ║");
  console.log("║        原始 HTTP 请求/响应 记录 & 安全写操作测试       ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");

  // ---- 8a. 准备工作 ----
  ensureDataDir();
  const token = loadToken();

  console.log("📋 账户信息");
  console.log(`  用户名:  ${token.username}`);
  console.log(`  userId:  ${token.userId}`);
  console.log(`  token:   ${token.access_token.slice(0, 20)}...`);
  console.log("");

  // ---- 8b. 测试读操作 ----
  console.log("═══ 读操作 (GET) 安全测试 ═══\n");

  const readRecords = [];
  for (const apiDef of READ_API_LIST) {
    const record = await testAndRecord(apiDef, token.access_token);
    readRecords.push(record);
  }

  const readPass = readRecords.filter((r) => r.success).length;
  const readFail = readRecords.filter((r) => !r.success).length;

  // ---- 8c. 测试写操作 ----
  let writeRecords = [];
  if (readFail === 0 || true) {
    // 即使部分读失败也继续写测试
    writeRecords = await testWriteOperations(token.access_token);
  } else {
    console.log("\n⚠️  读操作有失败，跳过写操作测试");
  }

  // ---- 8d. 生成汇总 ----
  const summary = generateSummary(token, readRecords, writeRecords);

  const totalPass = readPass + writeRecords.filter((r) => r.success).length;
  const totalFail = readFail + writeRecords.filter((r) => !r.success).length;

  // ---- 8e. 打印结果 ----
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("📊 测试汇总");
  console.log("────────────────────────────────────────────────────────");
  console.log(`  读操作:  ${readPass}/${readRecords.length} 通过`);
  if (readFail > 0) console.log(`           ${readFail} 个失败 — 详见 data/ 目录中的 JSON 文件`);
  console.log(`  写操作:  ${writeRecords.filter((r) => r.success).length}/${writeRecords.length} 通过`);
  console.log(`  总计:    ${totalPass}/${totalPass + totalFail} 通过`);
  console.log(`  数据目录: ${CONFIG.DATA_DIR}`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // 如果全部成功
  if (totalFail === 0) {
    console.log("✅ 全部测试通过，数据已保存到 tests/data/ 目录\n");
  } else {
    console.log("⚠️  部分测试失败，请查看以上输出或 data/ 目录中的 JSON 文件\n");
  }
}

// ============================================================
// 9. 执行
// ============================================================
main().catch((err) => {
  console.error("\n❌ 脚本异常退出:", err.message);
  process.exit(1);
});
