<template>
  <span
    class="chip"
    :style="`color: ${color}; background-color: ${backgroundColor ?? 'black'}`"
  >
    <span class="chip-content">
      <slot></slot>
    </span>
  </span>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
@Options({
  name: "Chip",
})
export default class Chip extends Vue {
  @Prop({ required: true }) color!: string;
  @Prop({}) backgroundColor!: string;
}
</script>

<style scoped lang="scss">
.chip {
  border-radius: 1em;
  background-color: red;
  white-space: nowrap;
  display: inline-block;

  .chip-content {
    white-space: nowrap;
    margin: 0.3em;
    padding: 0 0.8em;
    display: inline-block;
  }
}
</style>
