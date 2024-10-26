---
title: ADB命令集合
date: 2024-10-24 22:59:05
updated: 2024-10-24 23:04:23
category: ["技术"]
tags: ["Android","ADB"]
cover: https://segmentfault.com/img/bVdeH10?spec=cover
main_color: "#54C276"
keywords:
description:
top_img:
comments:
aside:
---

# 设备基础 #
|命令|说明|
|----|----|
|`adb devices`|列出已连接设备|
|`adb devices -l`|列出已连接设备和种类|
|`adb connect/disconnect [ip:port]`|连接到指定`IP`和端口的设备/断开连接|
|`adb root`|以`root`权限重新启动`adb`|
|`adb remount`|重新挂载具有读/写访问权限的文件系统|
|`adb start-server`|启动`adb`服务|
|`adb kill-server`|停止`adb`服务|
|`adb reboot`|重启设备|
|`adb reboot bootloader`|将设备重启到`fastboot`模式|
|`adb reboot recovery`|将设备重启到恢复模式|
|`adb disable-verify`|禁用设备的`dm-verity`安全特性|

# logcat #
|命令|说明|
|----|----|
|`adb logcat`|将日志消息打印到标准输出|
|`adb logcat -g`|显示当前日志缓冲大小|
|`adb logcat -G <size>`|设置缓冲区大小（`K`或`M`）|
|`adb logcat -c`|清除日志缓冲区|
|`adb logcat *:V`|启用所有日志消息（详细）|
|`adb logcat *:W`|显示优先级不低于**警告**的所有标记的所有日志消息|
|`adb logcat -f <filename>`|将日志转储到指定文件|

# 文件管理 #
|命令|说明|
|----|----|
|`adb push <local> <remote>`|将本地文件复制到远程设备|
|`adb pull <remote> <local>`|将远程设备文件复制到本地|

# 远程shell #
|命令|说明|
|----|----|
|`adb shell <command>`|在设备上运行指定的命令|
|`adb shell wm size`|显示当前屏幕分辨率|
|`adb shell wm size WxH`|将分辨率设置为`WxH`|
|`adb shell pm list packages`|列出所有已安装的应用包|
|`adb shell pm list packages -3`|列出所有已安装的第三方的应用包|
|`adb shell monkey -p app.package.name <count>`|启动指定包名的应用程序，并执行测试|

# 包安装 #
|命令|说明|
|----|----|
|`adb install <apk>`|安装应用程序|
|`adb install <path>`|从手机路径安装应用|
|`adb install -r <path>`|从手机路径安装应用（允许覆盖安装）|
|`adb uninstall <name>`|卸载应用程序|

# 包信息 #
|命令|说明|
|----|----|
|`adb install <apk>`|安装应用程序|