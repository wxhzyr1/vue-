<template>
    <div id="map"></div>
    <div class="untils">
        <div class="latlng-input">
            <p>寻点:</p>
            <t-input v-model="latlngInput" placeholder="输入id,经度,纬度,以逗号或空格隔开" style="width: 300px;" />
            <t-button @click="darwPoint">确认</t-button>
            <t-button @click="clearPoint" theme="default">清除绘点</t-button>
            <p>绘制省份:</p>
            <t-select placeholder="请选择省份" filterable style="width: 136px" v-model="province" @change="changeProvince"
              :options="options" clearable>
            </t-select>
            <t-space v-if="province" style="align-items: center;">
                <p>稀释程度:</p>
                <t-slider :min="0" @change="changeSlider" v-model="dilution" style="width: 100px;" />
                <p>{{ dilution }}</p>
            </t-space>
        </div>
        <t-space style="align-items: center;">
            <p>距离计算:</p>
            <t-input v-model="distance1" placeholder="输入经纬度坐标,以逗号间隔" style="width: 300px;" />
            <t-input v-model="distance2" placeholder="输入经纬度坐标,以逗号间隔" style="width: 300px;" />
            <t-input v-model="distance" disabled placeholder="距离" style="width: 300px;" />
        </t-space>
        <div class="measure-switch">
            <p>测绘:</p>
            <t-switch v-model="isMeasure" @change="measureChange"></t-switch>
            <p>绘制区域:</p>
            <t-switch v-model="isPolygon" @change="polygonChange"></t-switch>
        </div>
        <div v-if="latlngMessage" class="show-message">
            <div class="header">
                <p style="text-align: center;">围栏数据</p>
                <copy-icon class="copy-icon" @click="copy(latlngMessage)" style="cursor: pointer;" :fill-color='["#699ef5","#699ef5"]' :stroke-color='["#4787f0","#4787f0"]' :stroke-width="2"/>
            </div>
            <t-textarea disabled v-model="latlngMessage"></t-textarea>
        </div>
    </div>
    <div class="gga-show" v-if="ggaTxt">
        <p>{{ ggaTxt }}</p>
        <copy-icon @click="copy(ggaTxt)" style="cursor: pointer;" :fill-color='["#699ef5","#699ef5"]' :stroke-color='["#4787f0","#4787f0"]' :stroke-width="2"/>
    </div>
</template>
<script lang="ts" setup>
import emitter from "../untils/mybus";
import {computed, onMounted, ref} from "vue";
import {RenderMap} from "../untils/RenderMap";
import { CopyIcon } from "tdesign-icons-vue-next";
import {copyTest} from "../untils/pageuntils";
import L from "leaflet";
import { boundary } from "./map/100000_full";
import { ElMessage } from "element-plus";
const ggaTxt = ref("");
const latlngMessage = ref("");
const dilution = ref(0);
const province = ref("");
const isPolygon = ref(false);
const isMeasure = ref(false);
const latlngInput = ref("");
const distance1 = ref("");
const distance2 = ref("");
const options = ref<Array<{ label: string; value: string }>>([]);
emitter.on("changeGGA", (txt:any) => {
  ggaTxt.value = txt.gga;
});
const distance = computed(() => {
  try {
    const arr1 = distance1.value.split(",");
    const arr2 = distance2.value.split(",");
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
onMounted(()=>{
    map=new RenderMap("map", L);
    map.init();
    map.addMapClickListener()
})
let provinceIdx:number=-1;
const changeProvince = () => {
  if (!province.value) {
    map.onCreateProvinceLine(province.value, null);
    return;
  }
  const idx = boundary.features.findIndex(
    (item) => province.value == item.properties.name
  );
  provinceIdx=idx;
  changeSlider()
  if (idx !== -1 && boundary.features[idx]?.properties?.center) {
    const center = boundary.features[idx].properties.center;
    if (Array.isArray(center) && center.length >= 2) {
      map.setCenter(center[0],center[1], 8);
    }
  }
};
const dilutionArr=(arr:any[])=>{
    if(Array.isArray(arr[0][0])){
        arr.map(item=>{
            return dilutionArr(item)
        })
    }

}
const changeSlider = () => { 
    const arr=boundary.features[provinceIdx]?.geometry.coordinates
    if(!arr)return
    let data
    if(dilution.value==0)
    data = arr;
    else
    data = diluteCoordinates(arr);
    if (boundary.features[provinceIdx]?.geometry.type == "MultiPolygon") {
      map.onCreateProvinceLine(province.value, data);
    } else {
      map.onCreateProvinceLine(province.value, [data]);
    }
};
const diluteCoordinates=(coordinates: any[]): any[] => {
  function processLevel(arr: any[]): any[] {
    if (arr.length > 0 && typeof arr[0] === 'number') {
      return [...arr]; // 直接返回坐标点，不对其稀释
    }
    
    // 否则处理数组中的每个元素
    const result: any[] = [];
    for (let i = 0; i < arr.length; i += dilution.value) {
      const element = arr[i];
      if (Array.isArray(element)) {
        result.push(processLevel(element));
      } else {
        result.push(element);
      }
    }
    return result;
  }
  
  return processLevel(coordinates);
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
}
const polygonChange=()=>{
    if(isPolygon.value){
        map.startDrawPolygon()
    }else{
        map.clearPolygon()
    }
}
const darwPoint=()=>{
    const arr1=latlngInput.value.split(",")
    const arr2=latlngInput.value.split(" ")
    let arr=[]
    if(arr1.length==3||arr1.length==2){
        arr=arr1
    }else if(arr2.length==3||arr2.length==2){
        arr=arr2
    }else{
        ElMessage.error("格式错误")
        return
    }
    if(arr.length==3)
    map.drawPoint(arr[1],arr[2],arr[0],"base",true)
    else
    map.drawPoint(arr[0],arr[1],"","base",true)
}
const copy=(txt:string)=>{
    copyTest(txt)
}
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
    align-items: center;
    justify-content: center;
    gap: 10px;
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
}
</style>