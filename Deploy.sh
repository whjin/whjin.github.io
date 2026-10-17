#!/usr/bin/env sh

# commin信息格式：时间戳 + 提交信息

# ========== 切换到脚本所在目录 ==========
# 双击 .sh 会走 git-bash --no-cd，不会自动切到脚本目录，导致所有相对路径失效并静默失败。
# 这里确保 CWD 始终为仓库根目录（与 Deploy.command 保持一致）。
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "${SCRIPT_DIR}" || exit 1

COMMIT_FILE="Commit.md"
DEFAULT_MESSAGE="提交更新"
TIME_THRESHOLD=600  # 10分钟的秒数

# 1. 检查文件是否存在，不存在则创建
if [ ! -f "$COMMIT_FILE" ]; then
    touch "$COMMIT_FILE"
fi

# 2. 提取最新提交行的时间戳和消息内容
# 过滤空行 → 取第一行 → 拆分时间戳和消息体
latest_commit_line=$(sed '/^[[:space:]]*$/d' "$COMMIT_FILE" | head -n 1)

# 提取时间戳字符串（匹配 "YYYY-MM-DD HH:MM:SS" 格式开头）
commit_timestamp_str=$(echo "$latest_commit_line" | sed -E 's/^([0-9-]+ [0-9:.]+).*$/\1/')

# 提取剔除时间戳后的提交消息（去首尾空白）
latest_commit=$(echo "$latest_commit_line" | sed -E "s/^$commit_timestamp_str//i" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

# 3. 时间戳比对：判断与当前时间差是否超过TIME_THRESHOLD
if [ -n "$commit_timestamp_str" ]; then
    # 将提交时间戳转为Unix时间戳（秒），忽略转换失败的情况
    commit_timestamp=$(date -d "$commit_timestamp_str" +%s 2>/dev/null)
    if [ -n "$commit_timestamp" ]; then
        current_timestamp=$(date +%s)  # 当前时间戳
        time_diff=$(( current_timestamp - commit_timestamp ))
        time_diff=${time_diff#-}  # 取绝对值（避免负数差值）

        # 超过TIME_THRESHOLD则清空消息，后续会使用默认值
        if [ $time_diff -gt $TIME_THRESHOLD ]; then
            latest_commit=""
        fi
    fi
fi

# ========== Git 校验（避免在非仓库目录静默失败） ==========
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "[ERROR] 当前目录不是 Git 仓库！脚本目录：${SCRIPT_DIR}"
    exit 1
fi

echo "正在提交代码..."
git pull 2>/dev/null || echo "[WARN] pull 失败，跳过拉取直接提交"

# 生成 feed 数据（feed 由文章 front matter 构建，发布前运行）
node scripts/build-feed.cjs 2>/dev/null || echo "[WARN] build-feed 生成失败，跳过"

# 生成 sitemap（依据 feed 同步更新 sitemap.xml，保证新文章可被搜索引擎收录）
node scripts/build-sitemap.cjs 2>/dev/null || echo "[WARN] build-sitemap 生成失败，跳过"

# build 结束后清理 macOS AppleDouble 文件（build 新生成的文件会产生 ._* 伴生文件）
find . \( -name '._*' -o -name '.DS_Store' \) -not -path './.git/*' -delete 2>/dev/null || true

git add .

# 4. 判断是否有变更，若无则跳过提交，避免空提交报错
if ! git diff --cached --quiet; then
    # 5. 判断内容是否为空，若为空则使用默认提交信息
    if [ -n "$latest_commit" ]; then
        git commit -m "$latest_commit"
    else
        git commit -m "$DEFAULT_MESSAGE"
    fi
    git push
else
    echo "[INFO] 无需要提交的文件变更"
fi

# ========== 结束暂停（仅交互终端生效，解决双击看不到结果） ==========
# 命令行 / CI 运行（stdin 非终端）不阻塞，保持原行为
if [ -t 0 ]; then
    echo ""
    echo "按任意键关闭窗口...（3 秒后自动关闭）"
    read -n 1 -s -t 3 any_key 2>/dev/null || true
fi

exit 0