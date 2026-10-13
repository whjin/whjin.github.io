---
title: ADB命令集合
date: 2026-09-11
category: Android
description: "ADB（Android Debug Bridge）是 Android 开发和调试最核心的命令行工具。不管是安装 APK、抓日志、截屏、模拟点击，还是调试真机问题，都离不开它。本手册按使用场景分类整理，收藏后随查随用。 官方文档：完整的 ADB 参数说明见 Android Developers · Debug Your App，本文是实战命令速查。 一、环境准备 ADB 包含在 Android SDK Platform-Tools 中，独立安装即可，不需要下载完整 SDK： 真机调试前提：手机 → 设置 → 关于手机 → 连续点击\"版本号\"7 次开启开发者选项 → 开启\"USB 调试\"。 二、设"
---

ADB（Android Debug Bridge）是 Android 开发和调试最核心的命令行工具。不管是安装 APK、抓日志、截屏、模拟点击，还是调试真机问题，都离不开它。本手册按使用场景分类整理，收藏后随查随用。

> 官方文档：完整的 ADB 参数说明见 [Android Developers · Debug Your App](https://developer.android.com/studio/command-line/adb)，本文是实战命令速查。

## 一、环境准备

ADB 包含在 Android SDK Platform-Tools 中，独立安装即可，不需要下载完整 SDK：

```bash
# macOS（用 Homebrew）
brew install android-platform-tools

# 验证安装
adb version
```

**真机调试前提**：手机 → 设置 → 关于手机 → 连续点击"版本号"7 次开启开发者选项 → 开启"USB 调试"。

## 二、设备管理

| 命令 | 说明 |
|------|------|
| `adb devices` | 列出已连接设备 |
| `adb devices -l` | 列出设备详细信息（型号、序列号等） |
| `adb connect <ip>:5555` | 通过网络连接设备（无线调试） |
| `adb disconnect` | 断开所有网络连接 |
| `adb start-server` | 启动 ADB 服务 |
| `adb kill-server` | 重启 ADB 服务（遇到设备异常时常用） |
| `adb reboot` | 重启设备 |
| `adb reboot bootloader` | 重启到 Fastboot 模式 |
| `adb reboot recovery` | 重启到 Recovery 模式 |
| `adb root` | 以 root 权限重启 adbd（需 userdebug 版本系统） |
| `adb remount` | 重新挂载 `/system` 为可读写（需 root） |

### 多设备操作

同时连接多台设备时，用 `-s` 指定目标设备：

```bash
# 查看所有设备序列号
adb devices
# List of devices attached
# emulator-5554   device
# 7f1c864e        device

# 指定设备执行命令
adb -s 7f1c864e shell pm list packages
adb -s emulator-5554 install app.apk
```

### 无线调试（Android 11+）

Android 11 以后支持无需 USB 的无线调试：

```bash
# 方法一：手机上「开发者选项 → 无线调试」配对后
adb pair 192.168.1.100:30000
adb connect 192.168.1.100:30001

# 方法二：先用 USB 连接，再切换到网络模式
adb tcpip 5555
adb connect <手机IP>:5555
# 然后拔掉 USB 线
```

## 三、应用管理

### 安装与卸载

| 命令 | 说明 |
|------|------|
| `adb install app.apk` | 安装 APK |
| `adb install -r app.apk` | 覆盖安装（保留数据） |
| `adb install -d app.apk` | 允许版本降级安装 |
| `adb install -g app.apk` | 自动授予所有运行时权限 |
| `adb uninstall com.example.myapp` | 卸载应用 |
| `adb uninstall -k com.example.myapp` | 卸载但保留数据和缓存 |

### 查询应用

```bash
# 列出所有已安装包名
adb shell pm list packages

# 只看第三方应用
adb shell pm list packages -3

# 只看系统应用
adb shell pm list packages -s

# 按名称搜索（如找微信）
adb shell pm list packages | grep tencent

# 查看某个应用 APK 的路径
adb shell pm path com.example.myapp
# package:/data/app/.../base.apk
```

### 启动与停止应用

```bash
# 启动应用（通过包名找 launcher activity）
adb shell monkey -p com.example.myapp -c android.intent.category.LAUNCHER 1

# 强制停止应用
adb shell am force-stop com.example.myapp

# 清除应用数据
adb shell pm clear com.example.myapp
```

## 四、文件传输

| 命令 | 说明 |
|------|------|
| `adb push local.txt /sdcard/Download/` | 电脑 → 手机 |
| `adb pull /sdcard/Download/photo.jpg ./` | 手机 → 电脑 |

**示例：把日志文件从手机拉到电脑**

```bash
adb pull /sdcard/Android/data/com.example.myapp/logs ./logs/
```

## 五、日志抓取

`logcat` 是调试最常用的命令。

```bash
# 实时打印全部日志
adb logcat

# 只看某个应用的日志（按 PID 过滤）
adb shell pidof com.example.myapp
# 输出: 12345
adb logcat --pid=12345

# 按优先级过滤：只看 Warning 及以上
adb logcat *:W

# 按标签过滤
adb logcat -s "AndroidRuntime:E" "WebView:I"

# 清空日志缓冲区
adb logcat -c

# 保存日志到文件
adb logcat -d > log.txt

# 只看崩溃信息
adb logcat -b crash
```

**日志级别**（从低到高）：`V`（Verbose）→ `D`（Debug）→ `I`（Info）→ `W`（Warning）→ `E`（Error）→ `F`（Fatal）。

## 六、模拟输入与操作

| 命令 | 说明 |
|------|------|
| `adb shell input tap 500 800` | 点击屏幕坐标 (500, 800) |
| `adb shell input swipe 300 800 800 800 300` | 滑动：从 (300,800) 到 (800,800)，耗时 300ms |
| `adb shell input text "hello"` | 输入文本（仅支持 ASCII） |
| `adb shell input keyevent 26` | 按电源键 |
| `adb shell input keyevent 3` | 按 Home 键 |
| `adb shell input keyevent 4` | 按返回键 |
| `adb shell input keyevent 66` | 按回车键 |

**示例：模拟滑动解锁**

```bash
adb shell input swipe 540 1800 540 500 300
```

## 七、截屏与录屏

```bash
# 截屏并保存到手机
adb shell screencap -p /sdcard/screenshot.png

# 截屏直接保存到电脑
adb exec-out screencap -p > screenshot.png

# 录屏（最长 180 秒）
adb shell screenrecord /sdcard/demo.mp4
# Ctrl+C 停止录制

# 录屏并拉到电脑
adb shell screenrecord --time-limit 30 /sdcard/demo.mp4
adb pull /sdcard/demo.mp4 ./
```

## 八、设备信息查询

```bash
# 屏幕分辨率
adb shell wm size
# Physical size: 1080x2400

# 屏幕密度
adb shell wm density

# 电池信息
adb shell dumpsys battery

# 当前前台 Activity
adb shell dumpsys activity activities | grep mCurrentFocus

# 已安装的所有包及 APK 路径
adb shell pm list packages -f

# 设备型号和 Android 版本
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release

# CPU 信息
adb shell cat /proc/cpuinfo | head -5
```

## 九、实用技巧

### 打开网页

```bash
# 用默认浏览器打开网址
adb shell am start -a android.intent.action.VIEW -d https://wuhuajin.com
```

### 设置网络代理

```bash
# 设置代理（抓包时用）
adb shell settings put global http_proxy 127.0.0.1:8888

# 清除代理
adb shell settings put global http_proxy :0
```

### 备份应用数据

```bash
# 备份应用 APK + 数据
adb backup -apk -f backup.ab com.example.myapp

# 恢复备份
adb restore backup.ab
```

### 常见问题排查

| 问题 | 解决方法 |
|------|---------|
| `adb devices` 显示 `unauthorized` | 手机上点"允许 USB 调试"弹窗，勾选"始终允许" |
| 设备不识别 | 执行 `adb kill-server && adb start-server`，或换数据线 |
| 无线连接断连 | 检查手机和电脑是否在同一网段，重新 `adb connect` |
| `permission denied` | 很多 `/data` 路径需要 root 权限 |
| 中文输入失败 | `adb shell input text` 不支持中文，用其他方式（如剪贴板） |

## 十、高频命令速记

```bash
# 一键：连设备 → 装包 → 启动
adb connect 192.168.1.100:5555
adb install -r app.apk
adb shell monkey -p com.example.myapp -c android.intent.category.LAUNCHER 1

# 一键：抓崩溃日志
adb logcat -b crash -d > crash.txt

# 一键：截屏到电脑
adb exec-out screencap -p > screen.png

# 一键：通过名称找包名
adb shell pm list packages | grep keyword
```

---

ADB 命令不需要全背，记住高频的十几个，其他的用时查这份手册即可。日常开发最常用的组合：`devices` → `install` → `logcat` → `screencap`，掌握这四个就能解决 80% 的调试需求。

## 相关阅读

- [Git命令思维导图](https://wuhuajin.com/src/template/posts/Git/html/Git命令思维导图.html) — Git 常用命令速查图
- [Docker部署Meting API服务](https://wuhuajin.com/src/template/posts/工程化/html/Docker部署Meting%20API服务.html) — 用 Docker 部署后端服务的完整流程
- 官方文档：[Android Debug Bridge](https://developer.android.com/studio/command-line/adb) · [Shell 命令](https://developer.android.com/studio/command-line/shell.html)
