<template>
  <el-container>
    <el-button @click="$router.push('/')">Home</el-button>
    <el-button @click="login">Login</el-button>
  </el-container>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Action } from "vuex-class";

@Options({
  name: "Login"
})
export default class Login extends Vue {
  @Action("login")
  login!: () => void;
}
</script>

<style scoped>

</style>
