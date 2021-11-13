<template>
  <router-view />
</template>

<style lang="scss">
@use "sass:math";
@import url("https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;1,700&display=swap");
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  //background-color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

@for $i from 1 through 5 {
  .ma-#{$i} {
    margin: #{math.div($i, 2)}em !important;
  }
  .mx-#{$i} {
    margin-left: #{math.div($i, 2)}em !important;
    margin-right: #{math.div($i, 2)}em !important;
  }
  .my-#{$i} {
    margin-top: #{math.div($i, 2)}em !important;
    margin-bottom: #{math.div($i, 2)}em !important;
  }
  .mt-#{$i} {
    margin-top: #{math.div($i, 2)}em !important;
  }
  .mr-#{$i} {
    margin-right: #{math.div($i, 2)}em !important;
  }
  .mb-#{$i} {
    margin-bottom: #{math.div($i, 2)}em !important;
  }
  ml-#{$i} {
    margin-left: #{math.div($i, 2)}em !important;
  }
}
</style>
