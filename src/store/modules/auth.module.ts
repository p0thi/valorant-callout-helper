import { Module } from "vuex";
import axios from "axios";
import jwt from "jsonwebtoken";

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
    canEdit(state) {
      if (state.token) {
        const decoded = jwt.decode(state.token, { complete: true });
        switch (decoded?.payload.role) {
          case "ADMIN":
          case "EDITOR":
            return true;
        }
      }
      return false;
    },
  },
  mutations: {
    setToken(state, value) {
      state.token = value;
      axios.defaults.headers.common["Authorization"] = "Bearer " + value;
    },
    deleteToken(state) {
      state.token = undefined;
      console.log("token deleted");
      delete axios.defaults.headers.common["Authorization"];
    },
  },
};

export default authModule;
