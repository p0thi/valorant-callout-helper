<template>
  <el-container class="home">
    <el-aside v-if="isLoggedIn">
      <el-button @click="addMapDialogVisible = true">Add new Map</el-button>
      <el-button @click="logout()">Logout</el-button>
      <el-switch v-model="editMode" active-text="Edit mode"></el-switch>
      <el-button v-if="editMode" @click="saveCallouts"
        >Save {{ map.name }} Callouts</el-button
      >
    </el-aside>
    <el-container>
      <el-header>
        <el-dialog
          v-model="addMapDialogVisible"
          title="Add new Map"
          color="white"
          center
        >
          <el-form ref="addMapForm" :model="addMapFormData">
            <el-form-item label="Name">
              <el-input v-model="addMapFormData.name" type="text" />
            </el-form-item>
            <el-form-item label="Map">
              <el-upload
                ref="minimapUl"
                action="#"
                list-type="picture"
                drag
                :multiple="false"
                limit="1"
                :auto-upload="false"
                :on-change="handleMinimapUlChange"
                :file-list="addMapFormData.minimapsList"
                accept="image/*"
              >
                <el-button size="small" type="primary"
                  >Click to upload</el-button
                >
                <template #tip>
                  <div class="el-upload__tip">
                    jpg/png files with a size less than 500kb
                  </div>
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item label="Loading Screen">
              <el-upload
                ref="loadingScreenUl"
                action="#"
                list-type="picture"
                drag
                :multiple="false"
                limit="1"
                :auto-upload="false"
                :on-change="handleLoadingScreenUlChange"
                :file-list="addMapFormData.loadingScreenList"
                accept="image/*"
              >
                <el-button size="small" type="primary"
                  >Click to upload</el-button
                >
                <template #tip>
                  <div class="el-upload__tip">
                    jpg/png files with a size less than 500kb
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="addMapDialogVisible = false">Cancel</el-button>
              <el-button type="primary" @click="submitNewMap"
                >Confirm</el-button
              >
            </span>
          </template>
        </el-dialog>
        <el-tabs v-model="tabMap">
          <el-tab-pane
            v-for="(map, i) in maps"
            :key="i"
            :name="`${i}`"
            :label="map.name"
          >
            {{ map.name }}
          </el-tab-pane>
        </el-tabs>
      </el-header>
      <el-main>
        <el-row class="mb-2">
          <el-col :span="24">
            <el-switch v-model="learnMode" active-text="Learn mode"></el-switch>
          </el-col>
        </el-row>
        <el-row>
          <el-col v-if="isLoggedIn" :span="24"> </el-col>
        </el-row>
        <el-row v-if="maps" :gutter="15">
          <el-col :span="14">
            <map-view
              :mapId="tabMap"
              :learn-mode="learnMode"
              :edit-mode="editMode"
            ></map-view>
          </el-col>
          <el-col :span="10">
            <el-image
              v-if="map"
              class="minimap"
              fit="contain"
              :src="`/api/images/display/${map?.loadingScreen}`"
            />
            <el-input
              v-model="tagFilter"
              :clearable="true"
              placeholder="Filter..."
            ></el-input>
            <div>
              <el-tag
                v-for="(callout, i) in filteredCallouts"
                :key="`tag-${i}`"
                class="ma-1"
                :color="calloutTypeValues(callout).color"
                type="info"
                effect="dark"
              >
                <span draggable="true" @dragstart="dragstart($event, callout)">
                  {{ callout.name }}
                </span>
              </el-tag>
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { ref } from "vue";
import MapView from "@/views/MapView.vue";
import { Getter, Mutation, Action } from "vuex-class";
import IMapData from "@/data/interfaces/IMapData";
import { Container, Row, Col } from "iron-grid-system";
import ICallout from "@/data/interfaces/ICallout";
import AuthHandler from "@/util/AuthHandler";
import { ElUpload } from "element-plus";
import axios, { AxiosRequestConfig } from "axios";
import CalloutUtil, { TypeValue } from "@/data/classes/CalloutUtil";

interface NewMapFormData {
  name: string;
  minimapsList: any[];
  minimap?: Blob;
  loadingScreenList: any[];
  loadingScreen?: Blob;
}

@Options({
  components: {
    MapView,
    Container,
    Row,
    Col,
  },
})
export default class Home extends Vue {
  editMode = false;
  learnMode = true;
  addMapDialogVisible = false;
  addMapFormData: NewMapFormData = {
    name: "",
    minimapsList: [],
    minimap: undefined,
    loadingScreenList: [],
    loadingScreen: undefined,
  };
  tagFilter = "";

  $refs!: {
    loadingScreenUl: HTMLInputElement;
    minimapUl: typeof ElUpload;
    addMapForm: HTMLFormElement;
  };

  @Getter("getActiveMap")
  getActiveMap!: number;
  @Getter("getMaps")
  maps!: IMapData[];
  @Getter("isLoggedIn")
  isLoggedIn!: boolean;

  @Mutation("setActiveMap")
  setActiveMap!: (value: number) => void;

  @Action("login")
  login!: () => void;
  @Action("logout")
  logout!: () => void;
  @Action("fetchMaps")
  fetchMaps!: () => void;

  mounted() {
    this.fetchMaps();
  }

  get map() {
    return this.maps?.[this.getActiveMap];
  }

  get tabMap(): number {
    return this.getActiveMap;
  }

  set tabMap(value: number) {
    this.setActiveMap(value);
  }

  get filteredCallouts(): ICallout[] {
    let result: ICallout[];
    if (!this.tagFilter || this.tagFilter.length < 3)
      result = this.map?.callouts;
    else {
      result = this.map?.callouts.filter((c) =>
        c.name.toLowerCase().includes(this.tagFilter.toLowerCase())
      );
    }
    result = result
      ?.sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => a.type - b.type);
    return result;
  }

  calloutTypeValues(callout: ICallout): TypeValue {
    return CalloutUtil.typeData(callout);
  }

  saveCallouts() {
    if (!this.map) {
      return;
    }
    axios.put(`/api/callouts/${this.map?.id}`, {
      callouts: this.map?.callouts,
    });
  }

  dragstart(e: DragEvent, o: ICallout) {
    console.log("Data:", e.dataTransfer)
    e.dataTransfer?.setData("name", o.name);
    console.log("Data:", e.dataTransfer?.getData("name"))
  }

  handleLoadingScreenUlChange(file: any, targetArray: any[]) {
    this.addMapFormData.loadingScreen = file.raw;
    this.handleUlChange(file, targetArray);
  }

  handleMinimapUlChange(file: any, targetArray: any[]) {
    this.addMapFormData.minimap = file.raw;
    this.handleUlChange(file, targetArray);
  }

  handleUlChange(file: any, targetArray: any[]): void {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file.raw);
    reader.onload = (e) => {
      const i = targetArray.findIndex((x) => x.raw.uid === file.raw.uid);
      targetArray.splice(i, 1);
      targetArray.push({
        name: file.raw.name,
        url: e?.target?.result,
      });
    };
  }

  handleUlRemove(file: File, target: File[]) {
    const i = target.findIndex((x) => x.name === file.name);
    target.splice(i, 1);
  }

  submitNewMap(event: Event) {
    const formData = new FormData();

    if (
      !this.addMapFormData.name ||
      !this.addMapFormData.minimap ||
      !this.addMapFormData.loadingScreen
    )
      return;

    formData.append("minimap", this.addMapFormData.minimap);
    formData.append("loadingScreen", this.addMapFormData.loadingScreen);
    formData.append("name", this.addMapFormData.name);

    const config: AxiosRequestConfig<FormData> = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    axios.post("/api/maps/create", formData, config);
  }
}
</script>
