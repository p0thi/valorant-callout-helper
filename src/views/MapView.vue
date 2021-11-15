<template>
  <div v-show="map" class="map-viewer">
    <el-row>
      <el-col :span="24" class="mb-2">
        <el-button @click="reset"
          >Reset Minimap and Callouts
          <el-icon><refresh-left></refresh-left></el-icon
        ></el-button>
        <el-button @click="fetchMaps" icon
          >Reload all maps <el-icon><refresh></refresh></el-icon
        ></el-button>
      </el-col>
      <el-col :span="24">
        <div class="square-ratio-wrapper">
          <div
            class="square-ratio"
            ref="wrapper"
            :style="`font-size: ${size / 60}px`"
            @mousedown="wrapperMouseDown"
            @mousemove="wrapperMouseMove"
            @mouseup="wrapperMouseUp"
            @resize="onMapResize"
          >
            <img
              v-if="map"
              ref="minimap"
              class="minimap"
              fit="contain"
              :src="`/api/images/display/${map?.minimap}`"
              alt="Minimap"
            />
            <!--            <el-image-->
            <!--              v-if="map"-->
            <!--              ref="minimap"-->
            <!--              class="minimap"-->
            <!--              fit="contain"-->
            <!--              :src="`/api/images/display/${map?.minimap}`"-->
            <!--            />-->
            <div v-if="showCallouts" class="container">
              <callout
                class="callout"
                v-for="(callout, i) in callouts"
                :key="`$${callout.x}-${callout.y}`"
                @edit="calloutEdited($event, i)"
                @delete="calloutDeleted(i)"
                :x="callout.x"
                :y="callout.y"
                :callout="callout"
                :edit-mode="editMode"
                :display-name="learnMode"
              ></callout>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { mapGetters } from "vuex";
import Callout from "@/components/Callout.vue";
import { Container } from "iron-grid-system";
import { Action, Getter, Mutation } from "vuex-class";
import ICallout from "@/data/interfaces/ICallout";
import IMapData from "@/data/interfaces/IMapData";
import { ElUpload } from "element-plus";
import { Prop, Watch } from "vue-property-decorator";
import {
  communityColor,
  officialColor,
  minorColor,
} from "@/data/classes/CalloutUtil";
import { Refresh, RefreshLeft } from "@element-plus/icons";
import panzoom, { PanZoom } from "panzoom";
import ResizeObserver from "resize-observer-polyfill";

@Options({
  name: "MapView",
  components: {
    Callout,
    Container,
    Refresh,
    RefreshLeft,
  },
  methods: {
    modalOk() {
      this.map.callouts.push({
        name: this.debugName,
        x: this.debugX,
        y: this.debugY,
      });
      this.debugName = "";
      this.debugModal = false;

      console.log(this.map);
    },
  },
  computed: {
    loadingScreenImage() {
      return require(`@/assets/maps/loading_screens/${this.map.loadingScreen}`);
    },
  },
  // props: {
  //   learnMode: { type: Boolean, default: true },
  // },
})
export default class MapView extends Vue {
  $refs!: {
    loadingScreenUl: HTMLInputElement;
    minimap: HTMLElement & { $el: HTMLElement };
    addMapForm: HTMLFormElement;
    wrapper: HTMLElement;
  };
  debugModal = false;
  debug = false;
  debugX = 0;
  debugY = 0;
  debugName = "";
  mouseFlag: 0 | 1 = 0;
  panzoomInstance: PanZoom | null = null;

  communityColor = communityColor;
  minorColor = minorColor;
  officialColor = officialColor;

  showCallouts = true;

  showOfficial = true;
  showCommunity = true;
  showMinor = true;

  resizeObserver?: ResizeObserver | null = null;
  size?: number | null = null;

  @Watch("editMode")
  onEditModeChange(val: boolean) {
    if (val) {
      this.panzoomInstance?.moveTo(0, 0); // to be sure to go back to (0,0)
      this.panzoomInstance?.zoomAbs(0, 0, 1); // to be sure to go back to scale 1

      this.panzoomInstance?.pause();
    } else {
      this.panzoomInstance?.resume();
    }
  }

  @Prop({ default: true }) learnMode!: boolean;
  @Prop({ required: true }) callouts!: ICallout[];

  @Getter("getActiveMap")
  activeMapIndex!: number;
  @Getter("getMaps")
  maps!: IMapData[];
  @Mutation("setCallout")
  setCallout!: (data: {
    mapIndex: number;
    calloutIndex: number;
    callout: ICallout;
  }) => void;
  @Mutation("deleteCallout")
  deleteCallout!: (data: { mapIndex: number; calloutIndex: number }) => void;

  @Action("fetchMaps")
  fetchMaps!: () => void;

  get map() {
    return this.maps[this.mapId];
  }

  get filteredCallouts() {
    const result = this.map?.callouts.filter(
      (c) =>
        (c.type === 0 && this.showCommunity) ||
        (c.type === 1 && this.showOfficial) ||
        (c.type === 2 && this.showMinor)
    );
    return result;
  }

  @Prop({ required: true, default: true }) readonly editMode!: boolean;
  @Prop({ required: true }) readonly mapId!: number;

  mounted() {
    console.log("mounted");
    this.setupPanzoom();
    this.size = this.$refs.wrapper.getBoundingClientRect().width;
    this.resizeObserver = new ResizeObserver(this.onMapResize);
    this.resizeObserver.observe(
      this.$refs.wrapper);
  }

  unmounted() {
    this.resizeObserver?.disconnect()
  }

  wrapperMouseDown() {
    this.mouseFlag = 0;
  }
  wrapperMouseMove() {
    this.mouseFlag = 1;
  }
  wrapperMouseUp(event: DragEvent) {
    if (!this.editMode) return;
    if (this.mouseFlag === 0) {
      const x = (event.offsetX / this.$refs.minimap.$el.clientWidth) * 100;
      const y = (event.offsetY / this.$refs.minimap.$el.clientHeight) * 100;
      this.setCallout({
        mapIndex: this.activeMapIndex,
        calloutIndex: this.map?.callouts.length,
        callout: { name: "new callout", x, y, type: 0 },
      });
      this.debugModal = true;
    }
  }

  onMapResize(event: any) {
    console.log(event[0].contentRect.width);
    this.size = event[0].contentRect.width
  }

  reset() {
    this.showCallouts = false;
    this.$nextTick(() => {
      this.showCallouts = true;
      this.setupPanzoom();
    });
  }

  setupPanzoom() {
    const wrapper = this.$refs.wrapper;
    this.panzoomInstance = panzoom(wrapper, {
      bounds: true,
      boundsPadding: 0.05,
    });
    if (this.editMode) {
      this.panzoomInstance?.dispose();
    }
  }

  calloutEdited(event: ICallout, index: number) {
    this.setCallout({
      mapIndex: this.activeMapIndex,
      calloutIndex: index,
      callout: event,
    });
  }

  calloutDeleted(index: number) {
    this.deleteCallout({
      mapIndex: this.activeMapIndex,
      calloutIndex: index,
    });
  }
}
</script>

<style scoped lang="scss">
.debug {
  color: white;
}

.map-viewer {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
}

.list-label {
  color: antiquewhite;
}
.square-ratio-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 1.4vw;

  border: 0.06rem solid #507091;
  border-radius: 0.5rem;

  .square-ratio {
    position: relative;
    width: 100%;
    padding-bottom: 100%;

    .container {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .minimap {
      position: absolute;
      height: 100%;
      width: 100%;
      right: 0;
      left: 0;
      top: 0;
      bottom: 0;
      filter: drop-shadow(0px 0px 0.5em rgb(98, 82, 41));
    }
  }
}
</style>
