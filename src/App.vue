<template>
  <router-view />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme'


onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>
<style lang="scss">
@font-face {
  font-family: 'YSBTH';
  src: url('@/assets/ttf/YSBTH.ttf');
}
@font-face {
  font-family: 'ALSHT';
  src: url('@/assets/ttf/AlimamaShuHeiTi-Bold.ttf');
}
</style>
