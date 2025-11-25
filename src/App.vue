<template>
  <div id="map"></div>
  <div class="test_botton">
    <t-button @click="clearPoint">清除点</t-button>
    <div style="color: black;">
      绘制线
      <t-switch class="switch" @change="drawLine"></t-switch>
    </div>
  </div>
</template>
<script setup lang="ts">
import L, { LayerGroup, type LatLngExpression } from 'leaflet';
import { onMounted } from 'vue';
import point from '@/assets/img/point2.png'
import * as turf from '@turf/turf';
console.log(turf);

let map:any=null;
//点层线层提示层
let pointLayer:LayerGroup<any>
let lineLayer:LayerGroup<any>
let alertLayer:LayerGroup<any>
let polyLine:Array<any>=[]
onMounted(()=>{
  map=L.map("map",{
    center:[39.9,116.4],
    zoom: 13,
    minZoom: 4,
    attributionControl: false,
    zoomControl: false,
  })
  L.tileLayer(
      "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
    {
      subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
    }
  ).addTo(map);
  setTimeout(()=>{
    map.invalidateSize()
  },100)
  initEvent()
})
const mapImg=`<div class="icon">
  <img src="${point}">
  <p class="name">test</p>
</div>`
const initEvent=()=>{
  pointLayer=L.layerGroup().addTo(map)
  lineLayer=L.layerGroup().addTo(map)
  alertLayer=L.layerGroup().addTo(map)
  map.on('click',function(e:any){
    const { lat,lng}=e.latlng
    L.marker([lat,lng],{
      icon:L.divIcon({
        html:mapImg,
        className:'',
        iconSize:[25,41],
        iconAnchor:[12,41],
      })
    }).addTo(pointLayer)
  })
}
let poly:any=[]
let lastPoint:any=null
let lastMovePoint:any=null
let lastMovePoly:any=null
let lastMoveAlert:any=null
const getMiddle=()=>{
  const a=poly[poly.length-1]
  const b=poly[poly.length-2]
  return [
    (a[0]+b[0])/2,
    (a[1]+b[1])/2
  ] as LatLngExpression
}
const drawLine=(val:boolean)=>{
  if(val){
    polyLine.push([])
    map.off('click')
    map.on('mousemove',function(e:any){
      if(!poly.length)return
        const { lat,lng}=e.latlng
        const data=[lat,lng]
        if(lastPoint)poly[poly.length-1]=data
        else poly.push(data)
        lastPoint=data
        polyLine[polyLine.length-1]=poly
        // console.log(polyLine);
        const distance=L.latLng(poly[poly.length-2]).distanceTo(L.latLng([lat,lng]))
        const distance2=turf.distance(turf.point(poly[poly.length-2]),turf.point(poly[poly.length-1]),{units:'meters'})
        lastMovePoint&&pointLayer.removeLayer(lastMovePoint)
        lastMovePoly&&lineLayer.removeLayer(lastMovePoly)
        lastMoveAlert&&alertLayer.removeLayer(lastMoveAlert)
        lastMovePoint=L.circleMarker([lat,lng],{
          radius:10,
          color:'red',
          fillColor:'red',
          fillOpacity:0.5,
        }).addTo(pointLayer)
        const distanceImg=`<p class="distance">距离:${distance+";"+distance2}</p>`
        lastMoveAlert=L.marker(getMiddle(),{
          icon:L.divIcon({
            html:distanceImg,
            className:'',
            iconSize:[25,41],
            iconAnchor:[12,41],
          })
        }).addTo(alertLayer)
        lastMovePoly=L.polyline(polyLine,{
          color:'gray',
          weight:5,
          opacity:0.5,
        }).addTo(lineLayer)
    })
    map.on('click',function(e:any){
      const { lat,lng}=e.latlng
      poly.push([lat,lng])
      polyLine[polyLine.length-1]=poly
      L.circleMarker([lat,lng],{
        radius:10,
        color:'red',
        fillColor:'red',
        fillOpacity:0.5,
      }).addTo(pointLayer)
      L.polyline(polyLine,{
        color:'gray',
        weight:5,
        opacity:0.5,
      }).addTo(lineLayer)
    })
  }
  else{
    pointLayer.clearLayers()
    lineLayer.clearLayers()
    alertLayer.clearLayers()
    polyLine=[]
  }
}
const clearPoint=()=>{
  pointLayer.clearLayers()
}
</script>

<style scoped lang="scss">
.test_botton{
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 999;
  display: flex;
  gap: 20px;
}
#map{
  height: 100vh;
  ::v-deep{
    .distance{
      color: black;
      white-space: nowrap;
      font-size: 15px;
    }
  }
  ::v-deep .icon{
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: -20px;
    .name{
      font-size: 14px;
      color: black;
      text-align: center;
      margin-top: -20px;
    }
  }
}
</style>
