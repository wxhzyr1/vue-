<template>
    <div id="map"></div>
    <div class="untils">
        <div class="latlng-input">
            <p>寻点:</p>
            <t-textarea v-model="latlngInput" placeholder="输入id,经度,纬度,以空格隔开,多个点使用逗号隔开" class="point-input" />
            <t-button @click="darwPoint">绘点</t-button>
            <t-button @click="darwPoly">绘区</t-button>
            <t-button @click="clearPoint" theme="default">清除绘制</t-button>
            <p>绘制地区:</p>
            <t-input clearable style="width: 150px;" @enter="changeProvince" v-model="province" placeholder="输入地区名称" class="province-input" />
            <t-button @click="changeProvince">确认</t-button>
            <t-space v-if="province" style="align-items: center;">
                <p>稀释程度:</p>
                <t-slider :min="0" @change="changeSlider" v-model="dilution" style="width: 100px;" />
                <p>{{ dilution }}</p>
            </t-space>
        </div>
        <t-space style="align-items: center;">
            <p>距离计算:</p>
            <t-input v-model="distance1" placeholder="输入经纬度坐标,以空格间隔" style="width: 300px;" />
            <t-input v-model="distance2" placeholder="输入经纬度坐标,以空格间隔" style="width: 300px;" />
            <t-input v-model="distance" disabled placeholder="距离" style="width: 300px;" />
        </t-space>
        <t-space style="align-items: center;">
            <p>坐标转换:</p>
            <t-tooltip :content="trunOrigin">
              <t-input v-model="trunOrigin" placeholder="输入XYZ" style="width: 400px;" />
            </t-tooltip>
            <t-button @click="trunToXyz">
              <icon-font name="arrow-left" />
            </t-button>
            <t-button @click="trunToBlh">
              <icon-font name="arrow-right" />
            </t-button>
            <t-tooltip :content="trunResult">
              <t-input v-model="trunResult" placeholder="输入LBH  [L(经度), B(纬度), H(高)]" style="width: 400px;" />
            </t-tooltip>
        </t-space>
        <div class="measure-switch">
            <p>测绘:</p>
            <t-switch v-model="isMeasure" @change="measureChange"></t-switch>
            <p>绘制区域:</p>
            <t-switch v-model="isPolygon" @change="polygonChange"></t-switch>
        </div>
        <div v-if="latlngMessage" class="show-message">
            <div class="header">
                <p style="text-align: center;">区域围栏</p>
                <copy-icon class="copy-icon" @click="copy(latlngMessage)" style="cursor: pointer;" :fill-color='["#699ef5","#699ef5"]' :stroke-color='["#4787f0","#4787f0"]' :stroke-width="2"/>
            </div>
            <t-textarea disabled v-model="latlngMessage"></t-textarea>
        </div>
        <div v-if="provinceDiluteData" class="show-message">
            <div class="header">
                <p style="text-align: center;">省份围栏</p>
                <copy-icon class="copy-icon" @click="copy(provinceDiluteData)" style="cursor: pointer;" :fill-color='["#699ef5","#699ef5"]' :stroke-color='["#4787f0","#4787f0"]' :stroke-width="2"/>
            </div>
            <t-textarea disabled v-model="provinceDiluteData"></t-textarea>
        </div>
    </div>
    <div class="gga-show" v-if="ggaTxt">
      <t-space style="align-items: center;">
        <p>{{ latLng }}</p>
        <copy-icon @click="copy(latLng)" style="cursor: pointer;" :fill-color='["#699ef5","#699ef5"]' :stroke-color='["#4787f0","#4787f0"]' :stroke-width="2"/>
      </t-space>
      <t-space style="align-items: center;">
        <p>{{ ggaTxt }}</p>
        <copy-icon @click="copy(ggaTxt)" style="cursor: pointer;" :fill-color='["#699ef5","#699ef5"]' :stroke-color='["#4787f0","#4787f0"]' :stroke-width="2"/>
      </t-space>
    </div>
</template>
<script lang="ts" setup>
import emitter from "../untils/mybus";
import {computed, onMounted, ref, watch, watchEffect} from "vue";
import {RenderMap} from "../untils/RenderMap";
import { CopyIcon } from "tdesign-icons-vue-next";
import { copyTest } from "../untils/pageuntils";
import { IconFont } from 'tdesign-icons-vue-next';
import L from "leaflet";
import _ from "lodash";
import { getMapData } from "../api/mapApi";
import { boundary } from "./map/100000_full";
import { ElMessage } from "element-plus";
declare global {
  interface Window {
    Cesium: any;
  }
}
const ggaTxt = ref("");
const latlngMessage = ref("");
const dilution = ref(0);
const province = ref("");
const isPolygon = ref(false);
const isMeasure = ref(false);
const latlngInput = ref("");
const distance1 = ref("");
const trunTo = ref(1);
const trunOrigin = ref("");
const trunResult = ref("");
const distance2 = ref("");
const latLng = ref<any>("");
const provinceDiluteData = ref("");
const numberRegex:any = /-?\d+\.?\d*/g;
const options = ref<Array<{ label: string; value: string }>>([]);
emitter.on("changeGGA", (txt: any) => {
  latLng.value = txt.lng+" "+txt.lat;
  ggaTxt.value = txt.gga;
});
const trunToBlh = () => {
  let arr:any;
  try {
    arr = trunOrigin.value.match(numberRegex)?.map(Number)
  }catch (error) {
    return
  }
  const cartesian = new window.Cesium.Cartesian3(arr[0], arr[1], arr[2])
  const cartographic = window.Cesium.Cartographic.fromCartesian(cartesian);
  const longitude = window.Cesium.Math.toDegrees(cartographic.longitude); 
  const latitude = window.Cesium.Math.toDegrees(cartographic.latitude);   
  const height = cartographic.height;
  trunResult.value = `${longitude} ${latitude} ${height}`
}
const trunToXyz = () => {
  let arr:any;
  try {
    arr = trunResult.value.match(numberRegex)?.map(Number)
  }catch (error) {
    return
  }
  const cartographic = new window.Cesium.Cartographic(
    window.Cesium.Math.toRadians(arr[0]),  // 经度转弧度
    window.Cesium.Math.toRadians(arr[1]),  // 纬度转弧度
    arr[2]                           // 高程
  )
  const cartesian = window.Cesium.Cartographic.toCartesian(cartographic)
  const x = cartesian.x
  const y = cartesian.y
  const z = cartesian.z
  trunOrigin.value = `${x} ${y} ${z}`
}
const distance = computed(() => {
  try {
    const arr1 = distance1.value.split(" ");
    const arr2 = distance2.value.split(" ");
    if (arr1.length < 2 || arr2.length < 2) throw new Error("坐标不足");
    const lon1Str = arr1[0];
    const lat1Str = arr1[1];
    const lon2Str = arr2[0];
    const lat2Str = arr2[1];
    if (
      lon1Str == null || lat1Str == null ||
      lon2Str == null || lat2Str == null
    ) throw new Error("无效坐标");
    const lon1 = parseFloat(lon1Str);
    const lat1 = parseFloat(lat1Str);
    const lon2 = parseFloat(lon2Str);
    const lat2 = parseFloat(lat2Str);
    if (isNaN(lon1) || isNaN(lat1) || isNaN(lon2) || isNaN(lat2)) throw new Error("无效坐标");
    const p1 = L.latLng(lat1, lon1);
    const p2 = L.latLng(lat2, lon2);
    const dist = p1.distanceTo(p2);
    return dist.toFixed(2);
  } catch {
    return "0";
  }
});
emitter.on("changeFence", (txt:any) => {
    if(txt==`""`){
        latlngMessage.value=""
        return
    }
  latlngMessage.value = txt;
});
boundary.features.forEach((item) => {
  if (item.properties.name) {
    options.value.push({
      label: item.properties.name,
      value: item.properties.name,
    });
  }
});
let map:any=null
onMounted(() => {
    map=new RenderMap("map", L);
    map.init();
    map.addMapClickListener()
})
const darwPoly = () => {
  const arr = latlngInput.value.split(",").map(item => {
    const obj = item.split(" ").map(Number)
    return obj
  })
  arr.forEach((item:any) => {
    const i = item[0]
    item[0] = item[1]
    item[1] = i
  })
  map.drawPolygon(arr);
}
let provinceData:[]=[]
const provinceMessage = (province: string) => {
  getMapData({
    keywords: province,
  }).then((res: any) => {
    const { status, districts } = res
    if (status == 1) {
      let data = districts[0].polyline.split("|")
      const center=districts[0].center.split(",").map(Number)
      data = data.map((item: any) => {
        return item.split(";").map(
          (obj: any) => obj.split(",").map(Number)
        )
      })
      provinceData=data
      changeSlider()
      map.setCenter(center[0],center[1], 8)
    }
  })
}
const changeProvince = () => {
  if (!province.value) {
    return;
  }
  provinceMessage(province.value)
};
const changeSlider = () => { 
    let data = diluteCoordinates(provinceData);
    console.log(_.flatten(data));
    
  provinceDiluteData.value = _.flatten(data).map((item: any) => {
      item[0] = item[0]?.toFixed(6)
      item[1]=item[1]?.toFixed(6)
      return item.join(" ")
    }).join(",")
    map.onCreateProvinceLine(province.value, data);
};
const diluteCoordinates = (coordinates: any[]) => {
  return coordinates.map((item:[]) => { 
    return item.filter((obj,index) => {
      return !((index+1)%(dilution.value+1))
    })
  });
}
const measureChange=()=>{
    if(isMeasure.value){
        map.startMeasure()
    }else{
        map.stopMeasure()
        map.clearMeasure()
    }
}
const clearPoint=()=>{
    map.clearPoints()
    map.clearPoly()
}
const polygonChange=()=>{
    if(isPolygon.value){
        map.startDrawPolygon()
    }else{
        map.clearPolygon()
    }
}
const darwPoint = () => {
    const points=latlngInput.value.split(",");
    points.forEach((item) => {
      const arr=item.split(" ")
      if(arr.length==3)
      map.drawPoint(arr[1],arr[2],arr[0],"base",true)
      else if(arr.length==2)
        map.drawPoint(arr[0], arr[1], "", "base", true)
      else {
        ElMessage.error("格式错误")
        return
      }
    });
}
const copy=(txt:string)=>{
    copyTest(txt)
}
watch(() => province.value, (val) => {
  if (!val) {
    map.clearProvice()
  }
})
</script>
<style lang="scss">
#map {
  width: 100vw;
  height: 100vh;
}
.untils{
    position: absolute;
    z-index: 1000;
    top: 20px;
    left: 50px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 10px;
    border-radius: 20px;
    color: black;
    .measure-switch{
        display: flex;
        align-items: center;
        gap: 10px;
        flex-direction: row;
        p{
            color: black;
        }
    }
    .show-message{
        color: black;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 20px; 
        -webkit-backdrop-filter: blur(10px);
        padding: 5px 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        .header{
            position: relative;
            .copy-icon{ 
                position: absolute;
                right: 5px;
                top: 5px;
            }
        }
        p{
            margin: 3px 0;
            white-space: wrap;
        }
    }
    .latlng-input{
        display: flex;
        align-items: center;
        gap: 10px;
        .point-input{
          width: 300px;
        }
    }
}
.custom-marker {
  position: relative;
  z-index: 1000;
  .name {
    position: absolute;
    left: 50%;
    color: black;
    font-size: 14px;
    margin: 0;
    transform: translateX(-50%);
  }
  .base,
  .rover {
    width: 24px;
    height: 24px;
  }
  .base {
    background-image: url("./image/base.png");
    background-size: 100% 100%;
  }
  .rover {
    background-image: url("./image/rover.png");
    background-size: 100% 100%;
  }
}
.gga-show{
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 10px;
    right: 10px;
    border-radius: 20px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px); 
    -webkit-backdrop-filter: blur(10px);
    padding: 10px 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    color: black;
    p{
        margin: 3px 0;
    }
}
</style>