<template>
  <div>
    <h3> {{ msg }} </h3>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      msg: "Sample App"
    };
  }
};
</script>
