<template>
  <router-view></router-view>
  <SuzukaTrack></SuzukaTrack>
</template>

<script setup>
import SuzukaTrack from './components/suk.vue';
</script>

<style scoped>
.track-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
