<template>
  <component
    :is="editMode ? 'draggable' : 'div'"
    :style="`top: ${top}%; left: ${left}%; color: ${typeValues.color}; font-size: ${typeValues.fontSize};`"
    class="callout"
    @mousedown.stop
    @dragstart.prevent="dragstart"
    @drag.prevent="dragmove"
    @dragend.prevent="dragend"
  >
    <el-popover
      :disabled="!editMode"
      v-model:visible="popoverVisible"
      trigger="manual"
      width="13rem"
    >
      <template #default>
        <div v-if="editMode">
          <el-button
            @click="popoverVisible = false"
            class="float-right mb-2"
            type="text"
            ><el-icon><close></close></el-icon
          ></el-button>
          <el-input class="mb-1" v-model="editableName">
            <template #append>
              <el-icon><edit></edit></el-icon>
            </template>
          </el-input>

          <el-select class="mb-1" v-model="editableType">
            <el-option label="Community" :value="0"></el-option>
            <el-option label="Official" :value="1"></el-option>
            <el-option label="Minor" :value="2"></el-option>
          </el-select>
          <el-button class="mb-1" type="danger" @click="del" circle
            ><el-icon><delete></delete></el-icon
          ></el-button>
        </div>
      </template>
      <template #reference>
        <div @click="popoverVisible = !popoverVisible">
          <div v-if="showName">{{ callout.name }}</div>
          <div
            v-else
            :style="`background-color: ${typeValues.color};`"
            class="callout-placeholder"
            @dragover.prevent
            @drop="drop"
          ></div>
        </div>
      </template>
    </el-popover>
  </component>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import ICallout from "../data/interfaces/ICallout";
import { Delete, Edit, Close } from "@element-plus/icons";
import CalloutUtil, { TypeValue } from "@/data/classes/CalloutUtil";
import { Component, Prop } from "vue-property-decorator";
import Draggable from "@/components/Draggable.vue";
import { Ref, ref } from "vue";

@Options({
  name: "Callout",
  components: {
    Delete,
    Edit,
    Close,
    draggable: Draggable,
  },
})
export default class Callout extends Vue {
  popoverVisible = false;
  parent?: HTMLElement;
  name: string | null = null;
  tempX: number | null = null;
  tempY: number | null = null;
  startX: number | null = null;
  startY: number | null = null;

  @Prop({required: true}) callout!: ICallout
  @Prop({default: true}) displayName!: boolean
  @Prop({default: false}) editMode!: boolean
  @Prop({required: true}) x!: number
  @Prop({required: true}) y!: number

  setup() {
    console.log("############################")
  }

  get showName() {
    return this.displayName || this.name
  }

  get editableName() {
    return this.callout.name;
  }

  set editableName(value) {
    this.callout.name = value;
    this.$emit("edit", this.callout);
  }

  get editableType() {
    return this.callout.type;
  }
  set editableType(value) {
    this.callout.type = value;
    this.$emit("edit", this.callout);
  }

  get typeValues(): TypeValue {
    return CalloutUtil.typeData(this.callout)
  }

  get top() {
    return this.tempY ? this.tempY : this.y;
  }
  get left() {
    return this.tempX ? this.tempX : this.x;
  }

  drop(e: DragEvent) {
    console.log(e.dataTransfer)
    const name = e.dataTransfer?.getData("name");
    console.log("name", name)
    if (name === this.callout.name) {
      console.log("Baum")
      console.log(this.name)
      this.name = name;
      console.log(this.name)
    }
  }

  mounted() {
    this.parent = this.$el.parentElement;
    // this.$set(this, 'parent', this.$el.parentElement)
  }

  del() {
    this.$emit("delete");
    this.popoverVisible = false;
  }

  dragstart(event: DragEvent) {
    this.startX = event.clientX;
    this.startY = event.clientY;
    // this.tempHeight = this.infoOptions.height
    // this.tempWidth = this.infoOptions.width
    this.popoverVisible = false;
  }
  dragmove(event: DragEvent) {
    // console.log(event.clientX)
    if (!this.startX || !this.startY) return;
    if (event.clientX <= 0 || event.clientY <= 0) return;
    this.tempX =
      this.callout.x + this.calculateWidthPercent(event.clientX - this.startX);
    this.tempY =
      this.callout.y + this.calculateHeightPercent(event.clientY - this.startY);
  }
  dragend(event: DragEvent) {
    if (!this.tempX || !this.tempY) return;
    this.callout.x = this.tempX; //Math.max(0, Math.min(this.tempX, 100));
    this.tempX = null;
    this.callout.y = this.tempY; // Math.max(0, Math.min(this.tempY, 100));
    this.tempY = null;

    this.startX = null;
    this.startY = null;
  }
  calculateHeightPercent(pixels: number) {
    return 100 * parseFloat(`${pixels / parseFloat(`${this.parent?.offsetHeight}`)}`);
  }
  calculateWidthPercent(pixels: number) {
    return 100 * parseFloat(`${pixels / parseFloat(`${this.parent?.offsetWidth}`)}`);
  }
}
</script>

<style scoped lang="scss">
.callout {
  position: absolute;
  user-select: none;
  transform: translate(-50%, -50%);
  font-weight: bolder;
  text-shadow: -0.06rem -0.06rem 0 #000, 0.06rem -0.06rem 0 #000,
    -0.06rem 0.06rem 0 #000, 0.06rem 0.06rem 0 #000;

  .callout-placeholder {
    border-radius: 50%;
    height: 2.2em;
    width: 2.2em;
    opacity: 0.5;
  }
}
.float-right {
  float: right;
}
</style>
