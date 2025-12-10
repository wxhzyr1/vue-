<template>
  <div class="container">
    <router-view></router-view>
  </div>
</template>
<script setup lang="ts">
import * as Cesium from 'cesium'
window.Cesium = Cesium
window._AMapSecurityConfig = {
    securityJsCode: '6ee02a8b441b70e7b37c4b9cc6322ba4'
}

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
