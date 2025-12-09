<template>
    <div id="map"></div>
</template>
<script lang="ts" setup>
import CesiumMap from "@/mapUntils/index.ts";
import { onMounted } from "vue";
import data from "@/assets/xinjiang.json";
onMounted(() => { 
    const ele=document.getElementById('map')
    let map = null;
    if(ele){
        map = new CesiumMap(ele);
        map.init();
        map.drawPolygon(data,"#2AAAFF")
    }
})
</script>
<style scoped lang="scss">
#map{ 
    width: 100%;
    height: 100%;
}
</style>