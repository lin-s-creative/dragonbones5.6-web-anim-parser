<template>
  <main class="demo-page">
    <section class="demo-card">
      <div class="canvas-preview" :style="canvasPreviewStyle">
        <ColorTileBackground />
        <DragonBonesCanvas
          ref="dragonBones"
          :width="normalizedCanvasWidth"
          :height="normalizedCanvasHeight"
          :scale="0.3"
          :offset-x="offsetX"
          :offset-y="offsetY"
          armature-name="Armature"
          animation-name="animtion0"
          background-color="transparent"
        />
      </div>

      <div class="controls">
        <button type="button" @click="playAnimation">Play</button>
        <button type="button" @click="stopAnimation">Stop</button>
        <button type="button" @click="resetAnimation">Reset</button>
      </div>

      <div class="canvas-controls" aria-label="Canvas settings controls">
        <label class="canvas-field">
          <span>Canvas width</span>
          <input
            v-model.number="canvasWidth"
            type="number"
            step="10"
            min="50"
            max="1200"
          />
        </label>

        <label class="canvas-field">
          <span>Canvas height</span>
          <input
            v-model.number="canvasHeight"
            type="number"
            step="10"
            min="50"
            max="1200"
          />
        </label>

        <label class="canvas-field">
          <span>Offset X</span>
          <input
            v-model.number="offsetX"
            type="number"
            step="5"
            min="-300"
            max="300"
          />
        </label>

        <label class="canvas-field">
          <span>Offset Y</span>
          <input
            v-model.number="offsetY"
            type="number"
            step="5"
            min="-300"
            max="300"
          />
        </label>

        <button type="button" class="secondary-button" @click="resetPosition">
          Reset position
        </button>
      </div>
    </section>
  </main>
</template>

<script>
import DragonBonesCanvas from './components/DragonBonesCanvas.vue';
import ColorTileBackground from './components/ColorTileBackground.vue';

export default {
  name: 'App',
  components: {
    DragonBonesCanvas,
    ColorTileBackground,
  },
  data() {
    return {
      canvasWidth: 420,
      canvasHeight: 500,
      offsetX: 0,
      offsetY: 0,
    };
  },
  computed: {
    normalizedCanvasWidth() {
      return this.normalizeCanvasDimension(this.canvasWidth, 420);
    },
    normalizedCanvasHeight() {
      return this.normalizeCanvasDimension(this.canvasHeight, 500);
    },
    canvasPreviewStyle() {
      return {
        width: `${this.normalizedCanvasWidth}px`,
      };
    },
  },
  methods: {
    normalizeCanvasDimension(value, fallback) {
      const numberValue = Number(value);

      if (!Number.isFinite(numberValue) || numberValue <= 0) {
        return fallback;
      }

      return Math.min(Math.max(Math.round(numberValue), 50), 1200);
    },
    playAnimation() {
      this.$refs.dragonBones.playAnimation();
    },
    stopAnimation() {
      this.$refs.dragonBones.stopAnimation();
    },
    resetAnimation() {
      this.$refs.dragonBones.resetAnimation();
    },
    resetPosition() {
      this.offsetX = 0;
      this.offsetY = 0;
    },
  },
};
</script>
