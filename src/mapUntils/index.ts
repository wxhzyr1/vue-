import * as Cesium from 'cesium';
import AmapImageryProvider from './AmapImageryProvider';
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMTJkNGM0Yi0zNzFmLTQzZmMtOTY2NC1kMWRjMzkxZGMzNGUiLCJpZCI6MjAwMjIxLCJpYXQiOjE3MjA1MDEzNzN9.EYlw_iYUMth4BL73khouffw-UUSHzF-1Uhoiag8bBtU"
export default class CesiumMap { 
    element: HTMLElement;
    viewer: Cesium.Viewer|null= null;
    constructor(element: HTMLElement) { 
        this.element = element;
    }
    
    changeEarthColor() {
        if (!this.viewer) return;
        
        // 移除默认影像图层
        this.viewer.imageryLayers.removeAll();
        
        // 添加纯色图层作为基础颜色
        const colorLayer = this.viewer.imageryLayers.addImageryProvider(
            new Cesium.SingleTileImageryProvider({
                url: this.createSolidColorImage(Cesium.Color.fromCssColorString('#1a5dad')), // 蓝色背景
                rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90)
            })
        );
    }
    createGradientImage(): HTMLCanvasElement {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
        
      if (ctx) {
        // 创建垂直线性渐变
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0e6ad3ff');    // 起始颜色
        gradient.addColorStop(1, '#A0CFFF');    // 结束颜色
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      return canvas;
    }
    drawPolygon(coordinates: number[][], materialColor: string = '#FF0000') {
      if (!this.viewer) return;
        
      const polygonEntity = this.viewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(coordinates.flat()),
              material: new Cesium.ImageMaterialProperty({
              image: this.createGradientImage(),
              transparent: true
          }),
          outline: true,
          outlineColor: Cesium.Color.BLACK
        }
      });
      return polygonEntity;
    }
    createSolidColorImage(color: Cesium.Color): string {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = color.toCssColorString();
            ctx.fillRect(0, 0, 1, 1);
        }
        return canvas.toDataURL();
    }
    
    addGdLayer(options:any) {
        const layerProvider = new AmapImageryProvider(options);
        const imageryLayer:any = this.viewer?.imageryLayers.addImageryProvider(layerProvider as any);
        imageryLayer.brightness = 1.1;  // 亮度
        imageryLayer.contrast = 1.1;    // 对比度
        imageryLayer.hue = 0.1;         // 色调
        imageryLayer.saturation = 1.1;  // 饱和度
        imageryLayer.gamma = 1.0;  
    }
    init() { 
        Cesium.Ion.defaultAccessToken = token;
        this.viewer = new Cesium.Viewer(this.element, {
            timeline: false,
            animation: false,
            geocoder: false,
            sceneModePicker: false,
            fullscreenButton: false,
            vrButton: false,
            homeButton: false,
            infoBox: false,
            selectionIndicator: false,
            baseLayerPicker: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            scene3DOnly: false,
            shouldAnimate: true,
            terrainShadows: Cesium.ShadowMode.ENABLED,
            sceneMode: Cesium.SceneMode.SCENE3D,
            contextOptions: { webgl: { alpha: true } },
            creditContainer: document.createElement('div')
        })
        if (this.viewer) {
            this.addGdLayer({})
            this.viewer.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(114.71893,30.750941, 10000000),
                orientation: {
                    heading: 0,
                    pitch: -Cesium.Math.PI_OVER_TWO,
                    roll: 0
                }
            });
            this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1;
            this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = Infinity;
            // this.changeEarthColor();
            // this.addAdministrativeBoundaries()
        }
    }
}