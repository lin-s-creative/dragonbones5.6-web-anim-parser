<template>
  <aside class="animated-character-overlay" aria-label="Animation overlay with controls">
    <div
      class="canvas-preview animated-character-reveal"
      :class="{
        'canvas-preview--transparent': !showCanvasBackground,
        'animated-character-reveal--visible': isCharacterOverlayVisible,
      }"
      :style="canvasPreviewStyle"
      aria-label="Animation canvas preview"
    >
      <ColorTileBackground v-if="showCanvasBackground" />
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

    <div
      v-if="hasSpeechText"
      class="character-speech animated-character-reveal"
      :class="{ 'animated-character-reveal--visible': isSpeechBubbleVisible }"
      :style="speechBubbleStyle"
      role="status"
      aria-live="polite"
    >
      <p>{{ speechText }}</p>
    </div>

    <div
      class="toast-stack animated-character-reveal"
      :class="{ 'animated-character-reveal--visible': isCharacterOverlayVisible }"
      aria-live="polite"
      aria-atomic="false"
    >
      <article v-for="toast in toasts" :key="toast.id" class="toast">
        <strong>{{ toast.title }}</strong>
        <span>{{ toast.message }}</span>
      </article>
    </div>

    <section
      v-if="showAnimationControls"
      class="animated-character-card"
      aria-label="Animation, canvas, and speech controls"
    >
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
          <span>Internal offset X, px</span>
          <input
            v-model.number="offsetX"
            type="number"
            step="5"
            min="-300"
            max="300"
          />
        </label>

        <label class="canvas-field">
          <span>Internal offset Y, px</span>
          <input
            v-model.number="offsetY"
            type="number"
            step="5"
            min="-300"
            max="300"
          />
        </label>

        <label class="canvas-toggle">
          <input v-model="showCanvasBackground" type="checkbox" />
          <span>Show background</span>
        </label>
      </div>

      <div class="canvas-controls canvas-controls--position" aria-label="Canvas viewport position controls">
        <label class="canvas-field canvas-field--range">
          <span>Canvas center X, screen %</span>
          <input
            v-model.number="canvasViewportX"
            type="range"
            step="1"
            min="0"
            max="100"
          />
          <input
            v-model.number="canvasViewportX"
            type="number"
            step="1"
            min="0"
            max="100"
          />
        </label>

        <label class="canvas-field canvas-field--range">
          <span>Canvas center Y, screen %</span>
          <input
            v-model.number="canvasViewportY"
            type="range"
            step="1"
            min="0"
            max="100"
          />
          <input
            v-model.number="canvasViewportY"
            type="number"
            step="1"
            min="0"
            max="100"
          />
        </label>

        <p class="canvas-position-summary">
          Position: {{ normalizedCanvasViewportX }}vw / {{ normalizedCanvasViewportY }}vh
        </p>

        <button type="button" class="secondary-button" @click="resetPosition">
          Reset position
        </button>
      </div>

      <div class="canvas-controls speech-controls" aria-label="Speech bubble controls">
        <label class="canvas-field speech-text-field">
          <span>Speech text</span>
          <input
            v-model="speechText"
            type="text"
            maxlength="160"
            placeholder="Type the character speech"
          />
        </label>

        <label class="canvas-field">
          <span>Speech offset X, px</span>
          <input
            v-model.number="speechOffsetX"
            type="number"
            step="5"
            min="-600"
            max="600"
          />
        </label>

        <label class="canvas-field">
          <span>Speech offset Y, px</span>
          <input
            v-model.number="speechOffsetY"
            type="number"
            step="5"
            min="-600"
            max="600"
          />
        </label>

        <button type="button" class="secondary-button" @click="resetSpeechPosition">
          Reset speech position
        </button>
      </div>
    </section>
  </aside>
</template>

<script>
import DragonBonesCanvas from './components/DragonBonesCanvas.vue';
import ColorTileBackground from './components/ColorTileBackground.vue';

const DEFAULT_CHARACTER_OVERLAY_REVEAL_DELAY_MS = 3000;
const SPEECH_REVEAL_DELAY_OFFSET_MS = 3000;
const DEFAULT_CANVAS_WIDTH = 360;
const DEFAULT_CANVAS_HEIGHT = 440;
const MIN_CANVAS_DIMENSION = 50;
const MAX_CANVAS_DIMENSION = 1200;
const DEFAULT_CANVAS_VIEWPORT_X = 76;
const DEFAULT_CANVAS_VIEWPORT_Y = 48;
const MIN_CANVAS_VIEWPORT_PERCENT = 0;
const MAX_CANVAS_VIEWPORT_PERCENT = 100;
const DEFAULT_SPEECH_TEXT = 'Hello! I stay above the page while you scroll.';
const DEFAULT_SPEECH_OFFSET_X = -220;
const DEFAULT_SPEECH_OFFSET_Y = -210;
const MIN_SPEECH_OFFSET = -600;
const MAX_SPEECH_OFFSET = 600;

function normalizeRevealDelay(value, fallback = DEFAULT_CHARACTER_OVERLAY_REVEAL_DELAY_MS) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, Math.round(numberValue));
}

function getDefaultSpeechRevealDelay(revealDelay) {
  return normalizeRevealDelay(revealDelay) + SPEECH_REVEAL_DELAY_OFFSET_MS;
}

function normalizeSpeechRevealDelay(speechRevealDelay, revealDelay) {
  return normalizeRevealDelay(speechRevealDelay, getDefaultSpeechRevealDelay(revealDelay));
}

function shouldUseDelayedCharacterReveal(smoothReveal, revealDelay) {
  return smoothReveal && normalizeRevealDelay(revealDelay) > 0;
}

function shouldUseDelayedSpeechReveal(smoothReveal, speechRevealDelay, revealDelay) {
  return smoothReveal && normalizeSpeechRevealDelay(speechRevealDelay, revealDelay) > 0;
}

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
    smoothReveal: {
      type: Boolean,
      default: true,
    },
    revealDelay: {
      type: [Number, String],
      default: DEFAULT_CHARACTER_OVERLAY_REVEAL_DELAY_MS,
    },
    speechRevealDelay: {
      type: [Number, String],
      default: null,
    },
  },
  data() {
    return {
      canvasWidth: DEFAULT_CANVAS_WIDTH,
      canvasHeight: DEFAULT_CANVAS_HEIGHT,
      canvasViewportX: DEFAULT_CANVAS_VIEWPORT_X,
      canvasViewportY: DEFAULT_CANVAS_VIEWPORT_Y,
      showCanvasBackground: true,
      offsetX: 0,
      offsetY: 0,
      speechText: DEFAULT_SPEECH_TEXT,
      speechOffsetX: DEFAULT_SPEECH_OFFSET_X,
      speechOffsetY: DEFAULT_SPEECH_OFFSET_Y,
      toasts: [],
      nextToastId: 1,
      isCharacterOverlayVisible: !shouldUseDelayedCharacterReveal(this.smoothReveal, this.revealDelay),
      isSpeechBubbleVisible: !shouldUseDelayedSpeechReveal(
        this.smoothReveal,
        this.speechRevealDelay,
        this.revealDelay,
      ),
      characterOverlayRevealTimeoutId: null,
      speechBubbleRevealTimeoutId: null,
    };
  },
  computed: {
    normalizedCanvasWidth() {
      return this.normalizeCanvasDimension(this.canvasWidth, DEFAULT_CANVAS_WIDTH);
    },
    normalizedCanvasHeight() {
      return this.normalizeCanvasDimension(this.canvasHeight, DEFAULT_CANVAS_HEIGHT);
    },
    normalizedCanvasViewportX() {
      return this.normalizeViewportPercent(this.canvasViewportX, DEFAULT_CANVAS_VIEWPORT_X);
    },
    normalizedCanvasViewportY() {
      return this.normalizeViewportPercent(this.canvasViewportY, DEFAULT_CANVAS_VIEWPORT_Y);
    },
    canvasPreviewStyle() {
      return {
        width: `${this.normalizedCanvasWidth}px`,
        left: `${this.normalizedCanvasViewportX}vw`,
        top: `${this.normalizedCanvasViewportY}vh`,
        '--canvas-preview-border-color': this.showCanvasBackground ? 'rgb(191 219 254 / 34%)' : 'transparent',
        '--canvas-preview-shadow': this.showCanvasBackground ? '0 28px 70px rgb(15 23 42 / 34%)' : 'none',
      };
    },
    hasSpeechText() {
      return String(this.speechText || '').trim().length > 0;
    },
    normalizedSpeechOffsetX() {
      return this.normalizeSpeechOffset(this.speechOffsetX, DEFAULT_SPEECH_OFFSET_X);
    },
    normalizedSpeechOffsetY() {
      return this.normalizeSpeechOffset(this.speechOffsetY, DEFAULT_SPEECH_OFFSET_Y);
    },
    speechBubbleStyle() {
      return {
        left: `${this.normalizedCanvasViewportX}vw`,
        top: `${this.normalizedCanvasViewportY}vh`,
        transform: `translate(-50%, -50%) translate(${this.normalizedSpeechOffsetX}px, ${this.normalizedSpeechOffsetY}px)`,
      };
    },
    normalizedRevealDelay() {
      return normalizeRevealDelay(this.revealDelay);
    },
    normalizedSpeechRevealDelay() {
      return normalizeSpeechRevealDelay(this.speechRevealDelay, this.revealDelay);
    },
  },
  watch: {
    smoothReveal() {
      this.scheduleCharacterOverlayReveal();
      this.scheduleSpeechBubbleReveal();
    },
    revealDelay() {
      this.scheduleCharacterOverlayReveal();
      this.scheduleSpeechBubbleReveal();
    },
    speechRevealDelay() {
      this.scheduleSpeechBubbleReveal();
    },
  },
  mounted() {
    this.scheduleCharacterOverlayReveal();
    this.scheduleSpeechBubbleReveal();
  },
  beforeUnmount() {
    this.clearCharacterOverlayRevealTimeout();
    this.clearSpeechBubbleRevealTimeout();
  },
  methods: {
    clearCharacterOverlayRevealTimeout() {
      if (this.characterOverlayRevealTimeoutId !== null) {
        window.clearTimeout(this.characterOverlayRevealTimeoutId);
        this.characterOverlayRevealTimeoutId = null;
      }
    },
    clearSpeechBubbleRevealTimeout() {
      if (this.speechBubbleRevealTimeoutId !== null) {
        window.clearTimeout(this.speechBubbleRevealTimeoutId);
        this.speechBubbleRevealTimeoutId = null;
      }
    },
    scheduleCharacterOverlayReveal() {
      this.clearCharacterOverlayRevealTimeout();

      if (!this.smoothReveal || this.normalizedRevealDelay <= 0) {
        this.isCharacterOverlayVisible = true;
        return;
      }

      this.isCharacterOverlayVisible = false;
      this.characterOverlayRevealTimeoutId = window.setTimeout(() => {
        this.isCharacterOverlayVisible = true;
        this.characterOverlayRevealTimeoutId = null;
      }, this.normalizedRevealDelay);
    },
    scheduleSpeechBubbleReveal() {
      this.clearSpeechBubbleRevealTimeout();

      if (!this.smoothReveal || this.normalizedSpeechRevealDelay <= 0) {
        this.isSpeechBubbleVisible = true;
        return;
      }

      this.isSpeechBubbleVisible = false;
      this.speechBubbleRevealTimeoutId = window.setTimeout(() => {
        this.isSpeechBubbleVisible = true;
        this.speechBubbleRevealTimeoutId = null;
      }, this.normalizedSpeechRevealDelay);
    },
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
    normalizeViewportPercent(value, fallback) {
      const numberValue = Number(value);

      if (!Number.isFinite(numberValue)) {
        return fallback;
      }

      return Math.min(
        Math.max(Math.round(numberValue), MIN_CANVAS_VIEWPORT_PERCENT),
        MAX_CANVAS_VIEWPORT_PERCENT,
      );
    },
    normalizeSpeechOffset(value, fallback) {
      const numberValue = Number(value);

      if (!Number.isFinite(numberValue)) {
        return fallback;
      }

      return Math.min(
        Math.max(Math.round(numberValue), MIN_SPEECH_OFFSET),
        MAX_SPEECH_OFFSET,
      );
    },
    playAnimation() {
      const dragonBones = this.$refs.dragonBones;

      if (dragonBones) {
        dragonBones.playAnimation();
      }
    },
    stopAnimation() {
      const dragonBones = this.$refs.dragonBones;

      if (dragonBones) {
        dragonBones.stopAnimation();
      }
    },
    resetAnimation() {
      const dragonBones = this.$refs.dragonBones;

      if (dragonBones) {
        dragonBones.resetAnimation();
      }
    },
    resetPosition() {
      this.canvasViewportX = DEFAULT_CANVAS_VIEWPORT_X;
      this.canvasViewportY = DEFAULT_CANVAS_VIEWPORT_Y;
      this.offsetX = 0;
      this.offsetY = 0;
    },
    resetSpeechPosition() {
      this.speechOffsetX = DEFAULT_SPEECH_OFFSET_X;
      this.speechOffsetY = DEFAULT_SPEECH_OFFSET_Y;
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
.animated-character-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow: visible;
  pointer-events: none;
  isolation: isolate;
}

.animated-character-card {
  position: fixed;
  left: 24px;
  bottom: 24px;
  z-index: 1002;
  display: grid;
  width: min(760px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
  gap: 16px;
  overflow: auto;
  padding: 18px;
  border: 1px solid rgb(148 163 184 / 28%);
  border-radius: 24px;
  color: #dbeafe;
  background:
    linear-gradient(135deg, rgb(15 23 42 / 94%), rgb(30 41 59 / 86%)),
    radial-gradient(circle at 16% 0%, rgb(96 165 250 / 28%), transparent 42%);
  box-shadow: 0 26px 80px rgb(2 6 23 / 42%);
  backdrop-filter: blur(18px);
  pointer-events: auto;
}

.animated-character-reveal {
  visibility: hidden;
  opacity: 0;
  transition:
    opacity 600ms ease,
    visibility 0s linear 600ms;
}

.animated-character-reveal--visible {
  visibility: visible;
  opacity: 1;
  transition-delay: 0s;
}

.animated-character-reveal:not(.animated-character-reveal--visible) {
  pointer-events: none;
}

.canvas-preview {
  position: fixed;
  z-index: 1001;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  overflow: hidden;
  border: 1px solid var(--canvas-preview-border-color, rgb(191 219 254 / 34%));
  border-radius: 22px;
  background: transparent;
  transform: translate(-50%, -50%);
  box-shadow: var(--canvas-preview-shadow, 0 28px 70px rgb(15 23 42 / 34%));
  pointer-events: auto;
}

.canvas-preview--transparent {
  overflow: visible;
}

.canvas-preview .dragonbones-canvas {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: auto;
  cursor: pointer;
}

.character-speech {
  position: fixed;
  z-index: 1002;
  max-width: min(320px, calc(100vw - 48px));
  padding: 16px 18px;
  border: 1px solid rgb(191 219 254 / 50%);
  border-radius: 22px 22px 6px 22px;
  color: #e0f2fe;
  background:
    linear-gradient(135deg, rgb(15 23 42 / 92%), rgb(30 64 175 / 82%)),
    radial-gradient(circle at 12% 0%, rgb(125 211 252 / 40%), transparent 44%);
  box-shadow: 0 22px 60px rgb(2 6 23 / 38%);
  backdrop-filter: blur(16px);
  pointer-events: none;
}

.character-speech::after {
  position: absolute;
  right: 26px;
  bottom: -8px;
  width: 16px;
  height: 16px;
  border-right: 1px solid rgb(191 219 254 / 42%);
  border-bottom: 1px solid rgb(191 219 254 / 42%);
  background: rgb(30 64 175 / 84%);
  content: '';
  transform: rotate(45deg);
}

.character-speech p {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.45;
  text-shadow: 0 1px 12px rgb(2 6 23 / 34%);
  white-space: pre-wrap;
}

.toast-stack {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1003;
  display: grid;
  gap: 10px;
  width: min(320px, calc(100vw - 48px));
  pointer-events: none;
}

.toast {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid rgb(96 165 250 / 34%);
  border-radius: 16px;
  color: #e0f2fe;
  background: rgb(15 23 42 / 88%);
  box-shadow: 0 16px 40px rgb(2 6 23 / 34%);
  backdrop-filter: blur(12px);
}

.toast strong {
  color: #93c5fd;
  font-size: 14px;
}

.toast span {
  color: #cbd5e1;
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
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 10px 24px rgb(37 99 235 / 24%);
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

button:hover,
button:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgb(37 99 235 / 34%);
  filter: brightness(1.06);
  outline: none;
}

.secondary-button {
  color: #dbeafe;
  background: rgb(30 64 175 / 70%);
  box-shadow: inset 0 0 0 1px rgb(147 197 253 / 24%);
}

.secondary-button:hover,
.secondary-button:focus-visible {
  background: rgb(37 99 235 / 82%);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.canvas-controls {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  align-items: end;
  justify-content: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgb(148 163 184 / 18%);
  border-radius: 18px;
  background: rgb(15 23 42 / 42%);
}

.canvas-controls--position,
.speech-controls {
  align-items: center;
}

.canvas-field {
  display: grid;
  gap: 6px;
  color: #bfdbfe;
  font-size: 14px;
  font-weight: 800;
}

.canvas-field input {
  width: 130px;
  border: 1px solid rgb(147 197 253 / 28%);
  border-radius: 12px;
  padding: 9px 12px;
  color: #e0f2fe;
  background: rgb(2 6 23 / 62%);
  outline: none;
}

.canvas-field input:focus {
  border-color: rgb(96 165 250 / 76%);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 22%);
}

.speech-text-field {
  flex: 1 1 280px;
}

.speech-text-field input {
  width: min(100%, 360px);
}

.canvas-toggle {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  gap: 8px;
  color: #bfdbfe;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.canvas-toggle input {
  width: 18px;
  height: 18px;
  accent-color: #60a5fa;
  cursor: pointer;
}

.canvas-field--range {
  grid-template-columns: minmax(190px, 1fr) 76px;
  width: min(100%, 330px);
  align-items: center;
}

.canvas-field--range span {
  grid-column: 1 / -1;
}

.canvas-field--range input[type='range'] {
  width: 100%;
  padding: 0;
  accent-color: #60a5fa;
}

.canvas-field--range input[type='number'] {
  width: 76px;
}

.canvas-position-summary {
  margin: 0;
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 800;
}

@media (max-width: 760px) {
  .animated-character-card {
    left: 12px;
    bottom: 12px;
    width: calc(100vw - 24px);
    max-height: 44vh;
    gap: 12px;
    padding: 14px;
    border-radius: 20px;
  }

  .canvas-preview {
    max-width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
    border-radius: 18px;
  }

  .character-speech {
    max-width: min(280px, calc(100vw - 24px));
    padding: 14px 16px;
    border-radius: 18px 18px 6px 18px;
  }

  .character-speech p {
    font-size: 14px;
  }

  .character-speech {
    max-width: min(280px, calc(100vw - 24px));
    padding: 14px 16px;
    border-radius: 18px 18px 6px 18px;
  }

  .character-speech p {
    font-size: 14px;
  }

  .toast-stack {
    top: 12px;
    right: 12px;
    width: min(300px, calc(100vw - 24px));
  }

  .canvas-controls {
    justify-content: stretch;
    padding: 12px;
  }

  .canvas-field {
    flex: 1 1 132px;
  }

  .canvas-field input {
    width: 100%;
  }

  .canvas-field--range {
    grid-template-columns: minmax(120px, 1fr) 68px;
    width: 100%;
    flex-basis: 100%;
  }

  .canvas-field--range input[type='number'] {
    width: 68px;
  }
}
</style>
