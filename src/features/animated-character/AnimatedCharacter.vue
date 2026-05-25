<template>
  <main class="animated-character-page">
    <section class="animated-character-card">
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
          @object-click="showObjectClickToast"
        />
      </div>

      <div class="toast-stack" aria-live="polite" aria-atomic="false">
        <article v-for="toast in toasts" :key="toast.id" class="toast">
          <strong>{{ toast.title }}</strong>
          <span>{{ toast.message }}</span>
        </article>
      </div>

      <template v-if="showAnimationControls">
        <div class="controls" aria-label="Animation controls">
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
      </template>
    </section>
  </main>
</template>

<script>
import DragonBonesCanvas from './components/DragonBonesCanvas.vue';
import ColorTileBackground from './components/ColorTileBackground.vue';

const DEFAULT_CANVAS_WIDTH = 420;
const DEFAULT_CANVAS_HEIGHT = 500;
const MIN_CANVAS_DIMENSION = 50;
const MAX_CANVAS_DIMENSION = 1200;

export default {
  name: 'AnimatedCharacter',
  components: {
    DragonBonesCanvas,
    ColorTileBackground,
  },
  props: {
    showAnimationControls: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      canvasWidth: DEFAULT_CANVAS_WIDTH,
      canvasHeight: DEFAULT_CANVAS_HEIGHT,
      offsetX: 0,
      offsetY: 0,
      toasts: [],
      nextToastId: 1,
    };
  },
  computed: {
    normalizedCanvasWidth() {
      return this.normalizeCanvasDimension(this.canvasWidth, DEFAULT_CANVAS_WIDTH);
    },
    normalizedCanvasHeight() {
      return this.normalizeCanvasDimension(this.canvasHeight, DEFAULT_CANVAS_HEIGHT);
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

      return Math.min(
        Math.max(Math.round(numberValue), MIN_CANVAS_DIMENSION),
        MAX_CANVAS_DIMENSION,
      );
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
    showObjectClickToast(hitInfo) {
      const id = this.nextToastId;
      this.nextToastId += 1;
      this.toasts = [
        {
          id,
          title: 'Object click detected',
          message: `Slot: ${hitInfo.slotName}, texture: ${hitInfo.displayName}`,
        },
        ...this.toasts,
      ].slice(0, 4);

      window.setTimeout(() => {
        this.toasts = this.toasts.filter((toast) => toast.id !== id);
      }, 2600);
    },
  },
};
</script>

<style scoped>
.animated-character-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.animated-character-card {
  display: grid;
  gap: 16px;
  justify-items: center;
  padding: 20px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 18px 45px rgb(15 23 42 / 14%);
}

.canvas-preview {
  position: relative;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid rgb(15 23 42 / 10%);
  border-radius: 18px;
}

.canvas-preview .dragonbones-canvas {
  position: relative;
  z-index: 1;
  cursor: pointer;
}

.toast-stack {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 20;
  display: grid;
  gap: 10px;
  width: min(320px, calc(100vw - 48px));
  pointer-events: none;
}

.toast {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid rgb(37 99 235 / 25%);
  border-radius: 16px;
  color: #172033;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 16px 40px rgb(15 23 42 / 18%);
  backdrop-filter: blur(10px);
}

.toast strong {
  color: #1d4ed8;
  font-size: 14px;
}

.toast span {
  color: #475569;
  font-size: 13px;
}

button,
input {
  font: inherit;
}

button {
  border: 0;
  border-radius: 999px;
  padding: 10px 18px;
  color: #ffffff;
  background: #2563eb;
  font-weight: 700;
  cursor: pointer;
}

button:hover {
  background: #1d4ed8;
}

.secondary-button {
  color: #1d4ed8;
  background: #dbeafe;
}

.secondary-button:hover {
  background: #bfdbfe;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.canvas-controls {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: center;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  background: #f8fafc;
}

.canvas-field {
  display: grid;
  gap: 6px;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

.canvas-field input {
  width: 130px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 9px 12px;
  color: #172033;
  background: #ffffff;
}
</style>
