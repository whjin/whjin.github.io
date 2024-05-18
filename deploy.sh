#!/usr/bin/env sh

# 构建 && 部署
npm run build
npm run deploy

# 提交至dev分支
git add .
git commit -m "提交更新dev分支"
git push origin dev

# 按任意键关闭
echo "按任意键关闭"
read -n 1

# 关闭脚本
exit 0