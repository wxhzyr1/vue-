<template>
  <div class="container">
    <router-view></router-view>
  </div>
</template>
<script setup lang="ts">
import * as Cesium from 'cesium'
window.Cesium = Cesium
</script>

<style scoped lang="scss">
*{
  margin: 0;
  padding: 0;
}
.container{
  width: 100vw;
  height: 100vh;
}
</style>
