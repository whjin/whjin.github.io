#!/usr/bin/env sh

# 构建
npm run build
echo "构建完成"

# 部署
npm run deploy

# 提交至dev分支
git pull origin dev
git add .
read -p "请输入提交信息：" msg
git commit -m "$msg"
git push origin dev

# 按任意键关闭
echo "按任意键关闭"
read -n 1

# 关闭脚本
exit 0