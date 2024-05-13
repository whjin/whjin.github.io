#!/usr/bin/env sh

# 发生错误时终止
set -e

# 构建 && 部署
npm run deploy

# 创建临时分支
cd /d D:\ABlog\Blog\themes\anzhiyu
git subtree split -P themes/anzhiyu -b temp-branch
git push origin temp-branch:dev

# 提交至dev分支
git add .
git commit -m "提交更新dev分支"
git push origin dev

# 按任意键关闭
echo "按任意键关闭"
read -n 1

# 关闭脚本
exit 0