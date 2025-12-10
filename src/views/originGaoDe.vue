<template>
    <div id="map"></div>
</template>
<script lang="ts" setup>
import GaodeMap from '@/mapUntils/gaodeConfig';
import { onMounted } from 'vue';
let map:any=null
onMounted(() => { 
    map = new GaodeMap('map')
    map.init().then(() => {
        map.initAMap()
    })
})
</script>
<style lang="scss">
#map { 
    width: 100vw;
    height: 100vh;
}
</style>