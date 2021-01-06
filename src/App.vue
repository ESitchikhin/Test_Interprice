<template>
  <div id="app">
    <Mockup/>
  </div>
</template>

<script>
import Mockup from "@/components/Mockup";

export default {
  name: 'App',
  components: {
    Mockup,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
