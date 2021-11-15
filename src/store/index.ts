import { createStore } from "vuex";
import IMapData from "@/data/interfaces/IMapData";
import ICallout from "@/data/interfaces/ICallout";
import axios from "axios";
import AuthHandler from "@/util/AuthHandler";
import authModule from "@/store/modules/auth.module";
import createPersistedState from "vuex-persistedstate";
import router from "@/router";

const authState = createPersistedState({
  paths: ["authModule.token"],
});

interface State {
  activeMap: number
  maps: IMapData[]
}

const store = createStore<State>({
  state: {
    activeMap: 0,
    maps: [],
  },
  getters: {
    getActiveMap(state) {
      return state.activeMap;
    },
    getMaps(state) {
      return state.maps;
    },
  },
  mutations: {
    setActiveMap(state, value) {
      state.activeMap = value;
    },
    setMaps(state, value) {
      state.maps = value;
    },
    setCallout(state, data: {mapIndex: number; calloutIndex: number; callout: ICallout}) {
      if (data.calloutIndex >= state.maps[data.mapIndex].callouts.length) {
        state.maps[data.mapIndex].callouts.push(data.callout);
        return;
      }
      state.maps[data.mapIndex].callouts[data.calloutIndex] = data.callout
    },
    deleteCallout(state, data: {mapIndex: number; calloutIndex: number}) {
      state.maps[data.mapIndex].callouts.splice(data.calloutIndex, 1);
    }
  },
  actions: {
    login({ commit, dispatch, getters }) {
      new AuthHandler().auth().then((token) => {
        axios.defaults.headers.common["Authorization"] = token;
        commit("setToken", token);
      });
    },
    logout({ commit }) {
      commit("deleteToken");
      router.push("/");
    },
    fetchMaps({ commit }) {
      axios.get(`/api/maps/all`).then((res) => {
        commit("setMaps", res.data);
      });
    },
  },
  modules: {
    authModule,
  },
  plugins: [authState],
});

if (store.getters.getToken) {
  axios.defaults.headers.common["Authorization"] =
    "Bearer " + store.getters.getToken;
}

export default store;
