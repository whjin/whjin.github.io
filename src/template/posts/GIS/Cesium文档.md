---
title: Cesium文档
date: 2026-05-05
category: GIS
tags:
  - GIS
  - 三维
description: "Cesium 是一个用于构建三维地球与真实世界场景的开源地理空间引擎，可在浏览器中渲染高精度的地形、影像、矢量与三维模型，广泛应用于三维 GIS 可视化与数字孪生。本文档介绍 Cesium 的基础用法，包括场景与视口的初始化、地图底图与图层数据的加载、相机视角的控制、实体与图形的绘制、地形与影像服务的接入，以及性能优化与常见问题的排查。面向需要在 Web 端实现三维地球、智慧城市或空间展示应用的开发者，从入门到工程落地给出可复用的配置与代码思路，帮助快速掌握三维地理空间应用的开发方法与调试技巧。"
---

# Cesium 三维地球引擎实战指南

## 什么是 Cesium

Cesium 是一个基于 WebGL 的开源三维地球与地图引擎，能够在浏览器中直接渲染高精度的三维地球、地形、影像、矢量数据和三维模型。它被广泛用于智慧城市、数字孪生、航天可视化、安防应急、能源管网等行业场景。

相比传统的二维地图库，Cesium 的核心优势在于：

- **真三维**：支持全球范围内的连续缩放，从宏观地球到微观街景无缝过渡。
- **高性能**：基于 WebGL 硬件加速，配合 `3D Tiles` 流式加载海量数据。
- **开源可定制**：MIT 协议，社区活跃，官方文档完善，支持二次开发。
- **多数据格式**：原生支持 GeoJSON、KML、CZML、glTF、3D Tiles、WMS、WMTS 等。

## 快速开始：场景初始化

Cesium 的入口是 `Viewer`，它创建了包含地球、相机、时间轴、图层的完整三维场景。一个最小的初始化如下：

```javascript
import { Viewer } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const viewer = new Viewer('cesiumContainer', {
  baseLayerPicker: false,   // 关闭底图选择器
  timeline: false,          // 关闭时间轴
  animation: false,         // 关闭动画控件
  geocoder: false,          // 关闭地理搜索
  homeButton: false,
  infoBox: false,           // 关闭信息框
  selectionIndicator: false,
  shouldAnimate: true,
});
```

在实际项目中，通常会通过 `new Viewer` 传入的 `options` 关闭不需要的控件，以保持界面简洁、提升性能。

如果只需要地球而不需要完整的 UI 控件，可以使用 `CesiumWidget`：

```javascript
import { CesiumWidget } from 'cesium';
const widget = new CesiumWidget('cesiumContainer');
```

## 加载地图底图与图层

Cesium 默认使用在线影像服务作为底图，也可以通过 `ImageryProvider` 接入自定义瓦片服务（如天地图、ArcGIS、高德、自己发布的 TMS/WMTS）。

```javascript
import { WebMapTileServiceImageryProvider, Ion } from 'cesium';

// 使用天地图 WMTS 服务
const provider = new WebMapTileServiceImageryProvider({
  url: 'https://t0.tianditu.gov.cn/img_w/wmts',
  layer: 'img',
  style: 'default',
  format: 'tiles',
  tileMatrixSetID: 'w',
  maximumLevel: 18,
  credit: new Credit('天地图'),
});
viewer.imageryLayers.addImageryProvider(provider);
```

图层可以动态添加、移除和调整透明度：

```javascript
const layer = viewer.imageryLayers.addImageryProvider(provider);
layer.alpha = 0.6; // 设置透明度，便于叠加对比
```

## 相机控制

相机是三维场景的"眼睛"，Cesium 提供了 `flyTo`、`setView`、`lookAt` 等方法来控制视角。

```javascript
import { Cartesian3, HeadingPitchRoll, Transforms } from 'cesium';

// 飞到某个经纬度并设定高度
viewer.camera.flyTo({
  destination: Cartesian3.fromDegrees(116.397, 39.909, 5000),
  orientation: {
    heading: 0,
    pitch: -Math.PI / 2, // 垂直向下
    roll: 0,
  },
  duration: 3, // 飞行时长（秒）
});

// 围绕某个实体看向它
const position = Cartesian3.fromDegrees(116.397, 39.909, 200);
const hpr = new HeadingPitchRoll(0, -0.5, 0);
viewer.camera.lookAt(position, new Cartesian3(100, 100, 100));
```

## 实体与图形绘制

`Entity` 是 Cesium 中描述业务对象的高层 API，适合绘制点、线、面、标签、模型等。

```javascript
import { Cartesian3, Color, HeightReference, VerticalOrigin } from 'cesium';

// 一个带有标签的点
viewer.entities.add({
  position: Cartesian3.fromDegrees(116.397, 39.909, 0),
  point: { pixelSize: 10, color: Color.RED },
  label: {
    text: '天安门',
    font: '14px sans-serif',
    verticalOrigin: VerticalOrigin.BOTTOM,
    heightReference: HeightReference.CLAMP_TO_GROUND,
  },
});

// 一个多边形区域
viewer.entities.add({
  polygon: {
    hierarchy: Cartesian3.fromDegreesArray([
      116.35, 39.88, 116.42, 39.88, 116.42, 39.94, 116.35, 39.94,
    ]),
    material: Color.fromCssColorString('rgba(0, 128, 255, 0.4)'),
  },
});

// 加载 glTF 三维模型
viewer.entities.add({
  position: Cartesian3.fromDegrees(116.397, 39.909, 10),
  model: { uri: '/models/building.glb', scale: 1.0 },
});
```

对于海量建筑、倾斜摄影等数据，应使用 `Cesium3DTileset` 加载，而不是逐个 Entity，以保证性能。

## 地形与影像服务接入

Cesium 支持加载全球高精度地形，用于山体、高程的逼真显示。

```javascript
import { createWorldTerrainAsync } from 'cesium';

// 接入全球地形
const terrainProvider = await createWorldTerrainAsync();
viewer.terrainProvider = terrainProvider;
```

接入地形后，配合 `HeightReference.CLAMP_TO_GROUND`，可以让标注、点、线贴合地表，形成真实的三维效果。

## 性能优化实践

三维场景对性能敏感，以下做法可以显著提升流畅度：

1. **数据分级加载**：使用 3D Tiles 的 LOD（细节层次），避免一次性加载全部数据。
2. **控制绘制数量**：Entity 数量较多时改用 `CustomDataSource` 或批量合批。
3. **合理设置最大屏幕空间误差**：`tileset.maximumScreenSpaceError` 越大，渲染精度越低、性能越好，按需权衡。
4. **关闭不用的功能**：关闭阴影、抗锯齿、日志记录等。
5. **使用 `requestRenderMode`**：静态场景开启按需渲染，避免持续重绘消耗 GPU。
6. **瓦片缓存与预取**：根据相机位置预取周边瓦片，减少卡顿。

```javascript
viewer.scene.requestRenderMode = true;
viewer.scene.maximumRenderTimeChange = Infinity;
```

## 常见问题排查

- **白屏**：检查容器是否有明确高度（`#cesiumContainer { height: 100vh }`），并确认 WebGL 可用。
- **跨域加载失败**：确保地形、影像、3D Tiles 服务支持 CORS，配置 `Access-Control-Allow-Origin`。
- **模型不显示**：确认 glTF/glb 文件路径正确，模型单位与坐标系（默认 WGS84）匹配。
- **内存持续增长**：及时移除不再使用的 Entity 与图层，使用 `entities.removeById`。

## 应用场景

Cesium 的典型应用包括：

- 智慧城市：建筑白模、人口热力、管网三维展示。
- 数字孪生：将业务数据映射到三维空间，实现虚实联动。
- 航天与卫星：轨道展示、遥感影像叠加。
- 应急指挥：事件定位、资源调度、态势标绘。

掌握 Cesium 的三维渲染能力，配合后端空间数据服务，可以构建出专业、可交互的三维地理信息应用。
