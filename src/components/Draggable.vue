<template>
  <div ref="myDraggable" class="draggable">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import interact from "interactjs";

@Options({
  name: "Draggable",
})
export default class Draggable extends Vue {
  $refs!: {
    myDraggable: HTMLElement
  }
  mounted() {
    const myDraggable = this.$refs.myDraggable;
    this.initInteract(myDraggable);
  }

  initInteract(selector: HTMLElement) {
    // const old = {
    //   // // enable inertial throwing
    //   // inertia: true,
    //   // keep the element within the area of it's parent
    //   restrictRect: {
    //     restriction: "parent",
    //     endOnly: true,
    //     elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
    //   },
    //   // enable autoScroll
    //   autoScroll: true,
    //
    //   // call this function on every dragmove event
    //   onmove: this.dragMoveListener,
    //   // call this function on every dragend event
    //   onend: this.onDragEnd,
    //   onstart: this.onDragStart,
    // };
    interact(selector).draggable({
      listeners: {
        start: (event) => {
          this.$emit("dragstart", event);
        },
        move: (event) => {
          this.$emit("drag", event);
        },
        end: (event) => {
          this.$emit("dragend", event);
        },
      },
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: "parent",
          endOnly: true,
        }),
      ],
    });
  }
  // onDragStart(event) {
  //   this.$emit("dragstart", event);
  // }
  // dragMoveListener(event) {
  //   this.$emit("drag", event);
  // }
  // onDragEnd(event) {
  //   this.$emit("dragend", event);
  // }
}
</script>

<style scoped></style>
