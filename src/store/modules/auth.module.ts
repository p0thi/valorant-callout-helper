import { Module } from "vuex";
import axios from "axios";

const authModule: Module<any, any> = {
  state: {
    token: undefined,
  },
  getters: {
    getToken(state) {
      return state.token;
    },
    isLoggedIn(state) {
      return !!state.token;
    },
  },
  mutations: {
    setToken(state, value) {
      state.token = value;
      axios.defaults.headers.common["Authorization"] = "Bearer " + value;
    },
    deleteToken(state) {
      state.token = undefined;
      console.log("token deleted")
      delete axios.defaults.headers.common["Authorization"];
    },
  },
};

export default authModule;
