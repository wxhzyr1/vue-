import { toGGA } from "./toGGA";
import emitter from "./mybus";
import MapConfig from "./mapConfig";
import _ from 'lodash'
export class RenderMap {
  el: string; // 挂载节点
  map: any;
  Point: any;
  provincePolygons: any;
  staPoints: Array<any>;
  points: Array<any>;
  lines: Array<any>;
  L: any;
  isMeasuring: boolean = false;
  measureMarkers: any[] = [];
  measurePolylines: any[] = [];
  measureTooltips: any[] = [];
  tempLine: any = null;
  mouseMoveHandler: any = null;
  tempTooltip: any;
  onMeasureClickHandler: any = null;
  measureGround: any = []
  glifyLayer: any = null;
  markerClusterGroup: any = null;
  //围栏相关变量
  isDrawingPolygon: boolean = false;
  polygonPoints: any[] = [];
  tempPolygon: any = null;
  tempPolygonLine: any = null;
  polygonClickHandler: any = null;
  polygonMouseMoveHandler: any = null;
  polygonRightClickHandler: any = null;
  finalPolygon:Array<any> = [];
  //围栏点数据集
  fencePoints: Array<any> = [];
  polyList: Array<any> = [];
  constructor(el: string, L: any) {
    this.el = el;
    this.L = L;
    this.provincePolygons = [];
    this.staPoints = [];
    this.points = [];
    this.lines = [];
  }

  async init() {
    return new Promise((resolve, reject) => {
      const createMap = (lat: any, lng: any) => {
        this.map = this.L.map(this.el, {
          center: [lat, lng],
          zoom: 5,
          minZoom: 4,
          maxZoom: 18,
          attributionControl: false,
        });
        
        // 初始化点聚合组
        if(this.L.markerClusterGroup){
            this.markerClusterGroup = this.L.markerClusterGroup({
            chunkedLoading: true,
            zoomToBoundsOnClick: true,
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            removeOutsideVisibleBounds: true,
            maxClusterRadius: 40,
          });

          this.map.addLayer(this.markerClusterGroup);
        }
        this.initMap();
        resolve(this.map);
      };

      createMap(38.537794, 114.348847);
    });
  }
  onPolygonClick(e: any) {
    const latlng = e.latlng;
    // 添加点到数组
    this.polygonPoints.push(latlng);
    let arr:any=[]
    this.polygonPoints.map(point => {
      arr.push([point.lat, point.lng])
    });
    if(!this.fencePoints.length){
      this.fencePoints.push(arr);
    }
    else{
      this.fencePoints[this.fencePoints.length-1]=arr;
    }
    // 如果至少有两个点，绘制或多边形
    if (this.polygonPoints.length >= 2) {
      if (this.tempPolygon) {
        this.map.removeLayer(this.tempPolygon);
      }

      // 创建多边形
      this.tempPolygon = this.L.polygon([...this.polygonPoints], {
        fillColor: "#3388ff",
        fillOpacity: 0.2,
        color: "#3388ff",
        weight: 2,
        opacity: 1,
      }).addTo(this.map);
    }
    let polyginArr:string[]=[]
    
    this.fencePoints.forEach(item => {
      if (Array.isArray(item)) {
        item.forEach(obj => {
          polyginArr.push(obj)
        });
      }
      else {
        polyginArr.push(item);
      }
    });
    polyginArr.forEach((item:any) => {
      const i = item[0].toFixed(2)
      item[0] = item[1].toFixed(2);
      item[1]=i
    })
    emitter.emit("changeFence", polyginArr.map((item:any)=>item.join(" ")).join(","));
  }
  onPolygonMouseMove(e: any) {
    if (this.polygonPoints.length === 0) return;
    const latlng = e.latlng;
    const latLngs = [...this.polygonPoints, latlng];
    
    // 更新或创建临时线条
    if (this.tempPolygonLine) {
      this.tempPolygonLine.setLatLngs(latLngs);
      this.tempPolygon.setLatLngs(latLngs);
    } else {
      this.tempPolygon=this.L.polygon([...latLngs], {
        fillColor: "#3388ff",
        fillOpacity: 0.2,
        color: "#3388ff",
        weight: 2,
        opacity: 1,
      }).addTo(this.map);
      this.tempPolygonLine = this.L.polyline(latLngs, {
        color: "#3388ff",
        weight: 2,
        dashArray: "5, 5",
      }).addTo(this.map);
    }
  }
  clearPolygon() {
    this.isDrawingPolygon = false;
    this.finalPolygon.forEach(polygon => {
      this.map.removeLayer(polygon);
    });
    this.finalPolygon = [];
    this.fencePoints = [];
    emitter.emit("changeFence",JSON.stringify(""));
    // 解绑事件
    if (this.polygonClickHandler) {
      this.map.off("click", this.polygonClickHandler);
      this.polygonClickHandler = null;
    }

    if (this.polygonMouseMoveHandler) {
      this.map.off("mousemove", this.polygonMouseMoveHandler);
      this.polygonMouseMoveHandler = null;
    }
    if(this.polygonRightClickHandler){
      this.map.off("contextmenu", this.polygonRightClickHandler);
      this.polygonRightClickHandler = null;
    }
  }
  finishDrawPolygon() {
    // 清除临时线条
    if (this.tempPolygonLine) {
      this.map.removeLayer(this.tempPolygonLine);
      this.tempPolygonLine = null;
    }
    if(this.tempPolygon){
      this.map.removeLayer(this.tempPolygon);
      this.tempPolygon = null;
    }
    this.tempPolygon = this.L.polygon([...this.polygonPoints], {
      fillColor: "#3388ff",
      fillOpacity: 0.2,
      color: "#3388ff",
      weight: 2,
      opacity: 1,
    }).addTo(this.map);
    // 返回最终的多边形
    this.finalPolygon.push(this.tempPolygon);
    this.tempPolygon = null;
    //准备第二次绘制
    this.fencePoints.push([])
    this.polygonPoints = [];
  }
  startDrawPolygon() {
    this.isDrawingPolygon = true;
    this.polygonPoints = [];

    // 清除之前的临时图形
    if (this.tempPolygon) {
      this.map.removeLayer(this.tempPolygon);
      this.tempPolygon = null;
    }

    if (this.tempPolygonLine) {
      this.map.removeLayer(this.tempPolygonLine);
      this.tempPolygonLine = null;
    }

    // 绑定事件
    this.polygonClickHandler = this.onPolygonClick.bind(this);
    this.polygonMouseMoveHandler = this.onPolygonMouseMove.bind(this);
    this.polygonRightClickHandler = this.finishDrawPolygon.bind(this);
    this.map.on("click", this.polygonClickHandler);
    this.map.on("mousemove", this.polygonMouseMoveHandler);
    this.map.on("contextmenu", this.polygonRightClickHandler);
  }
  initMap() {
    let tile = MapConfig.mapUrl;
    this.L.tileLayer(tile, {
      subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
    }).addTo(this.map);
    setTimeout(() => {
      this.map.invalidateSize(); // 强制重新计算尺寸
    }, 100);
  }
  // 修改地图中心点
  setCenter(lng: string, lat: string, zoom: number = 12) {
    console.log(lng, lat);
    this.map.flyTo(
      [lat, lng],
      this.map.getZoom() < zoom ? zoom : this.map.getZoom(),
      {
        duration: 1,
      }
    );
  }
  // 创建点标注
  clearPoint(lng: string, lat: string) {
    if (this.Point) {
      this.map.removeLayer(this.Point);
    }
    const markerHtml = `
      <div class="custom-marker">
          <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png">
          <div class="close-btn">×</div>
      </div>
    `;

    const icon = this.L.divIcon({
      html: markerHtml,
      className: "", // 清除默认样式
      iconSize: [25, 34],
    });

    this.Point = this.L.marker([lat, lng], { icon }).addTo(this.map);

    // 绑定删除事件
    this.Point.getElement()
      .querySelector(".close-btn")
      .addEventListener("click", () => {
        this.map.removeLayer(this.Point);
      });
  }
  clearProvice() {
    if (this.provincePolygons.length > 0) {
      this.provincePolygons.forEach((polygon: any) => {
        this.map.removeLayer(polygon); // Leaflet 使用 removeLayer
      });
      this.provincePolygons = [];
    }
  }
  // 绘制省份边界
  onCreateProvinceLine(province: string, data: any) {
    // 假设 data 是省份边界坐标数组，格式：L.LatLngExpression[][]
    if (this.provincePolygons.length > 0) {
      this.provincePolygons.forEach((polygon: any) => {
        this.map.removeLayer(polygon); // Leaflet 使用 removeLayer
      });
      this.provincePolygons = [];
    }
    // if (!province) {
    //   return;
    // }
    data.forEach((item: any, index: number) => {
      // 转换坐标格式（Leaflet 需要 [lat, lng]）
      const latLngs: any = item.map((coord: [number, number]) => [
        coord[1], // lat
        coord[0], // lng
      ]);

      // 创建多边形（等效于高德的 AMap.Polygon）
      this.provincePolygons[index] = this.L.polygon(latLngs, {
        fillColor: "#ccebc5",
        fillOpacity: 0.5,
        color: "#2b8cbe",
        weight: 1,
        opacity: 1,
        lineCap: "round",
        dashArray: "5, 5",
        className: "province-polygon", // 自定义样式类
      }).addTo(this.map);

      // 绑定交互事件（如点击）
      this.provincePolygons[index].on("click", () => {
        console.log("Clicked polygon index:", index);
      });
    });
  }
  // 绘制点线
  drawMarker(data: any) {
    this.points.forEach((item) => {
      this.map.removeLayer(item);
    });
    this.lines.forEach((item) => {
      this.map.removeLayer(item);
    });
    this.lines = [];
    this.points = [];
    data.forEach((item: any) => {
      this.drawPoint(item.baselng, item.baselat, item.basesitename, "base");
      this.drawPoint(item.roverlng, item.roverlat, item.roversitename, "rover");
      this.drawLine(item);
    });
  }

  drawPoint(lng: number, lat: number, name: string, type: string,fly:boolean=false) {
    let PointContent = `
      <div class="custom-marker" style="transform: translateY(-12px);">
        <div class="${type}"></div>
        <p class="name">${name}</p>
      </div>
    `;

    const icon = this.L.divIcon({
      html: PointContent,
      className: "", // 清除默认样式
      iconSize: [20, 20],
    });

    const Point = this.L.marker([lat, lng], { icon }).addTo(this.map);
    Point.getElement().addEventListener("click", () => {
      const gga = toGGA(lat, lng);
      emitter.emit("changeGGA", gga);
    });
    fly&&this.setCenter(lng.toString(), lat.toString(),8)
    this.points.push(Point);
  }
  // 添加地图点击事件监听，输出经纬度
  addMapClickListener() {
    if (!this.map) {
      // console.warn('地图尚未初始化，延迟添加点击监听器');
      // 延迟执行，等待地图初始化完成
      setTimeout(() => {
        this.addMapClickListener();
      }, 500);
      return;
    }
    this.map.on("dblclick", (e: any) => {
      // alert();
      console.log(e)
    })

    this.map.on("click", (e: any) => {
      console.log(e)
      const { lat, lng } = e.latlng;
      const gga = toGGA(lat, lng);
      const info = {
        lat,
        lng,
        gga
      }
      console.log(info)
      emitter.emit("changeGGA", info);
    });
    this.map.on("contextmenu", () => {
      emitter.emit("changeGGA", '');
      if (this.measureMarkers.length > 0) {
        this.measureGround.push({
          measureMarkers: [...this.measureMarkers],
          measurePolylines: [...this.measurePolylines],
          measureTooltips: [...this.measureTooltips]
        })
      }
      // 刚开始的时候不要右键就可以停止绘制
      if (!(this.measureGround.length == 0 && this.measureMarkers.length == 0)) {
        this.stopMeasure();
      }
      if (this.measureGround.length > 0) {
        this.startMeasure();
      }
    });

    // 禁用浏览器默认右键菜单
    this.map.getContainer().addEventListener("contextmenu", (e: any) => e.preventDefault());
  }
  drawLine(data: any) {
    let path: any[][] = [
      [data.baselat, data.baselng],
      [data.roverlat, data.roverlng],
    ];
    console.log(path);
    const greenLine = this.L.polyline(path, {
      color: data.state === 0 ? "green" : "red", // 线条颜色
      weight: 2, // 线条宽度（像素）
      opacity: 0.7, // 透明度
    }).addTo(this.map);

    this.lines.push(greenLine);
  }
  clearPoints(){
    this.points.forEach((item) => {
      this.map.removeLayer(item);
    });
  }
  // 删除全部数据实现刷新效果
  refresh() {
    if (this.Point) {
      this.map.removeLayer(this.Point);
    }
    if (this.markerClusterGroup) {
      this.markerClusterGroup.clearLayers();
    }
    this.points.forEach((item) => {
      this.map.removeLayer(item);
    });
    this.lines.forEach((item) => {
      this.map.removeLayer(item);
    });
    this.lines = [];
    this.points = [];
    this.staPoints = [];
  }
  // renderPoint(
  //   lng: number,
  //   lat: number,
  //   name: string,
  //   state: any = 0,
  //   datastate: any = 1
  // ) {
  //   let img = "";
  //   let type = "type1";
  //   if (state == -1) {
  //     img = "<img src='./img/point0.png' style='width: 16px; height: 21px;' />";
  //     type = "type0";
  //   } else {
  //     if (datastate == 0) {
  //       img =
  //         "<img src='./img/point2.png' style='width: 16px; height: 21px;' />";
  //       type = "type2";
  //     } else {
  //       img =
  //         "<img src='./img/point1.png' style='width: 16px; height: 21px;' />";
  //       type = "type1";
  //     }
  //   }
  //   var PointContent = `
  //     <div class="custom-marker">
  //       <div class="point ${type}" style="width: 32px;height: 42px;" />
  //       <p class="name">${name}</p>
  //     </div>
  //   `;

  //   const icon = this.L.divIcon({
  //     html: PointContent,
  //     className: "", // 清除默认样式
  //     iconSize: [32, 42],
  //   });

  //   console.log(this.map)
  //   const Point = this.L.marker([lat, lng], { icon }).addTo(this.map);
  //   this.staPoints.push(Point);
  // }

  renderPoint(
    lng: number,
    lat: number,
    name: string,
    state: any = 0,
    datastate: any = 1,
    info: any
  ) {
    let color = "#00ff00"; // 默认绿色
    if (state === -1) color = "#999999";
    else if (datastate === 0) color = "#ff0000";

    const circle = this.L.circleMarker([lat, lng], {
      radius: 6,
      color,
      weight: 1,
      fillColor: color,
      fillOpacity: 0.9,
    });
    !this.markerClusterGroup&&this.map.addLayer(circle);
    circle.on("click", (e: any) => {
      emitter.emit("getInfo", info);
    });

    circle.bindTooltip(name, { permanent: false, direction: "top" });
    
    // 添加到聚合组而不是直接添加到地图
    this.markerClusterGroup&&this.markerClusterGroup.addLayer(circle);
    this.staPoints.push(circle);
  }

  removePoint() {
    if (this.markerClusterGroup) {
      this.markerClusterGroup.clearLayers();
    }
    this.staPoints = [];
  }
  drawPolygon(data: any) { 
    const polygon = this.L.polygon(data, {
      fillColor: "#3388ff",
      fillOpacity: 0.2,
      color: "#3388ff",
      weight: 2,
      opacity: 1,
    }).addTo(this.map);
    this.polyList.push(polygon);
  }
  clearPoly() { 
    this.polyList.forEach((item) => {
      this.map.removeLayer(item);
    });
    this.polyList = [];
  }
  // 开始测距方法
  startMeasure() {
    this.isMeasuring = true;
    this.measureMarkers = [];
    this.measurePolylines = [];
    this.measureTooltips = [];

    // 保存绑定后的引用
    this.onMeasureClickHandler = this.onMeasureClick.bind(this);
    this.mouseMoveHandler = this.onMouseMove.bind(this);

    // 绑定事件
    this.map.on("click", this.onMeasureClickHandler);
    this.map.on("mousemove", this.mouseMoveHandler);
  }

  // 处理点击添加点并测距
  onMeasureClick(e: any) {
    const latlng = e.latlng;

    // 添加测量点
    const marker = this.L.circleMarker(latlng, {
      radius: 5,
      color: "blue",
    }).addTo(this.map);
    this.measureMarkers.push(marker);

    const len = this.measureMarkers.length;
    if (len > 1) {
      const latlngs = [
        this.measureMarkers[len - 2].getLatLng(),
        this.measureMarkers[len - 1].getLatLng(),
      ];

      // 添加折线
      const line = this.L.polyline(latlngs, {
        color: "blue",
        weight: 2,
      }).addTo(this.map);
      this.measurePolylines.push(line);

      // 计算距离并标注
      const distance = latlngs[0].distanceTo(latlngs[1]);
      const midPoint = this.getMidPoint(latlngs[0], latlngs[1]);

      const tooltip = this.L.marker(midPoint, {
        icon: this.L.divIcon({
          className: "",
          html: `<div style="background:#fff;color:black;border:1px solid #999;border-radius:3px;padding:2px 4px;font-size:12px;">${distance.toFixed(
            2
          )} m</div>`,
          iconSize: [80, 24],
        }),
      }).addTo(this.map);

      this.measureTooltips.push(tooltip);
    }
  }

  // 鼠标移动时显示临时虚线段
  onMouseMove(e: any) {
    const latlng = e.latlng;

    if (this.measureMarkers.length === 0) return;

    const lastLatlng =
      this.measureMarkers[this.measureMarkers.length - 1].getLatLng();

    if (this.tempLine) {
      this.tempLine.setLatLngs([lastLatlng, latlng]);
    } else {
      this.tempLine = this.L.polyline([lastLatlng, latlng], {
        color: "gray",
        dashArray: "4, 4",
        weight: 2,
      }).addTo(this.map);
    }

    // 临时提示文字
    if (this.tempTooltip) {
      this.tempTooltip.setLatLng(this.getMidPoint(lastLatlng, latlng));
      const distance = lastLatlng.distanceTo(latlng);
      console.log(distance,lastLatlng, latlng);
      
      this.tempTooltip.setIcon(
        this.L.divIcon({
          className: "",
          html: `<div style="background:#fff;border:1px dashed #999;color:black;border-radius:3px;padding:2px 4px;font-size:12px;">${distance.toFixed(
            2
          )} m</div>`,
          iconSize: [80, 24],
        })
      );
    } else {
      const distance = lastLatlng.distanceTo(latlng);
      this.tempTooltip = this.L.marker(this.getMidPoint(lastLatlng, latlng), {
        icon: this.L.divIcon({
          className: "",
          html: `<div style="background:#fff;color:black;border:1px dashed #999;border-radius:3px;padding:2px 4px;font-size:12px;">${distance.toFixed(
            2
          )} m</div>`,
          iconSize: [80, 24],
        }),
      }).addTo(this.map);
    }
  }

  // 结束测距与清除
  stopMeasure() {
    this.isMeasuring = false;

    // ✅ 正确解绑
    if (this.onMeasureClickHandler) {
      this.map.off("click", this.onMeasureClickHandler);
      this.onMeasureClickHandler = null;
    }

    if (this.mouseMoveHandler) {
      this.map.off("mousemove", this.mouseMoveHandler);
      this.mouseMoveHandler = null;
    }

    if (this.tempLine) {
      this.map.removeLayer(this.tempLine);
      this.tempLine = null;
    }

    if (this.tempTooltip) {
      this.map.removeLayer(this.tempTooltip);
      this.tempTooltip = null;
    }
  }

  clearMeasure() {
    this.measureMarkers.forEach((m) => this.map.removeLayer(m));
    this.measurePolylines.forEach((l) => this.map.removeLayer(l));
    this.measureTooltips.forEach((t) => this.map.removeLayer(t));
    this.measureGround.forEach((item: any) => {
      item.measureMarkers.forEach((m: any) => this.map.removeLayer(m));
      item.measurePolylines.forEach((l: any) => this.map.removeLayer(l));
      item.measureTooltips.forEach((t: any) => this.map.removeLayer(t));
    })

    this.measureMarkers = [];
    this.measurePolylines = [];
    this.measureTooltips = [];
    this.measureGround = [];
  }

  // 获取中点
  getMidPoint(p1: any, p2: any) {
    return this.L.latLng((p1.lat + p2.lat) / 2, (p1.lng + p2.lng) / 2);
  }
}

