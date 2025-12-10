import AMapLoader from "@amap/amap-jsapi-loader";
const key = "01cefc860225f08712bb2d4e70d19418"
const securityJsCode="6ee02a8b441b70e7b37c4b9cc6322ba4"
export default class GaodeMap { 
    element: string|null=null;
    viewer: any = null;
    constructor(element: string) { 
        this.element = element;
        // window._AMapSecurityConfig = {
        //   securityJsCode: '6ee02a8b441b70e7b37c4b9cc6322ba4', // 这里需要替换为你的实际安全密钥
        // };
    }
    init() {
        return new Promise((resolve, reject) => {
          window._AMapSecurityConfig = {
            securityJsCode: securityJsCode,
          };
          const script = document.createElement('script');
          script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${key}`;
          script.onload = resolve;
          script.onerror = reject; 
          document.head.appendChild(script); 
        });
    }
    initAMap() {
      // 检查 SDK 是否加载成功
      if (!window.AMap) {
        console.error('AMap SDK 未加载');
        return;
      }

      // 创建地图实例
      this.viewer = new window.AMap.Map(this.element, {
        zoom: 12, // 初始缩放级别
        center: [116.397428, 39.90923], // 初始中心点坐标（北京天安门）
        mapStyle: "amap://styles/2ffb5989679be06db1a654bbdc48ffae", // 地图样式，替换为你的实际样式码
        viewMode: '3D',
        buildingAnimation: true, // 楼块出现是否带动画
        expandZoomRange: true, // 是否开启zoom范围扩展
        zooms: [2, 20]
      });
    }
}