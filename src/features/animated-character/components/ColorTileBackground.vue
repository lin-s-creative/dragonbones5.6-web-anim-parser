<template>
  <div class="color-tile-background" aria-hidden="true">
    <span
      v-for="tile in tiles"
      :key="tile"
      class="color-tile"
      :style="{ '--tile-color': colors[tile % colors.length] }"
    ></span>
  </div>
</template>

<script>
const TILE_COUNT = 120;

export default {
  name: 'ColorTileBackground',
  data() {
    return {
      tiles: Array.from({ length: TILE_COUNT }, (_, index) => index),
      colors: [
        '#f97316',
        '#facc15',
        '#22c55e',
        '#06b6d4',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#ef4444',
      ],
    };
  },
};
</script>

<style scoped>
.color-tile-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  overflow: hidden;
  pointer-events: none;
}

.color-tile {
  min-height: 40px;
  background: var(--tile-color);
}
</style>
