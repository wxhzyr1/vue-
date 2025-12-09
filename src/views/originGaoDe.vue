<template>
    <div id="map"></div>
</template>
<script lang="ts">
import GaodeMap from '@/mapUntils/gaodeConfig';
import { onMounted } from 'vue';
let map=null
onMounted(() => { 
    map = new GaodeMap('map')
    map.init()
})
</script>
<style lang="scss">
#map { 
    width: 100vw;
    height: 100vh;
}
</style>