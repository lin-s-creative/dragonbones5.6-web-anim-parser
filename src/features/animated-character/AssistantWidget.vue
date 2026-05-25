<template>
  <aside
    v-show="!isClosed"
    ref="widget"
    class="assistant-widget"
    :class="{ 'assistant-widget--visible': isVisible }"
    aria-label="Виджет ИИ ассистента"
  >
    <p ref="bubble" class="assistant-widget__bubble">
      Есть вопрос спросите ии ассистента.
    </p>

    <div class="assistant-widget__character-wrap">
      <div class="assistant-widget__stage" aria-hidden="true">
        <ColorTileBackground />
        <DragonBonesCanvas
          ref="character"
          class="assistant-widget__canvas"
          :width="canvasWidth"
          :height="canvasHeight"
          :scale="characterScale"
          :offset-x="characterOffsetX"
          :offset-y="characterOffsetY"
          armature-name="Armature"
          animation-name="animtion0"
          background-color="transparent"
          aria-label="Анимированный ИИ ассистент"
        />
      </div>

      <button
        type="button"
        class="assistant-widget__close"
        aria-label="Скрыть ассистента"
        @click="hideWidget"
      >
        ×
      </button>
    </div>
  </aside>
</template>

<script>
import { gsap } from 'gsap';
import ColorTileBackground from './components/ColorTileBackground.vue';
import DragonBonesCanvas from './components/DragonBonesCanvas.vue';

const REVEAL_DELAY_MS = 2600;
const REVEAL_DURATION_SECONDS = 0.9;
const EXIT_DURATION_SECONDS = 0.64;
const HIDDEN_X = 260;
const HIDDEN_Y = 56;

export default {
  name: 'AssistantWidget',
  components: {
    ColorTileBackground,
    DragonBonesCanvas,
  },
  data() {
    return {
      canvasWidth: 280,
      canvasHeight: 340,
      characterScale: 0.26,
      characterOffsetX: 0,
      characterOffsetY: -72,
      isClosed: false,
      isVisible: false,
      revealTimerId: 0,
      activeTimeline: null,
    };
  },
  mounted() {
    this.revealTimerId = window.setTimeout(() => {
      this.showWidget();
    }, REVEAL_DELAY_MS);
  },
  beforeUnmount() {
    this.clearRevealTimer();
    this.killActiveTimeline();
  },
  methods: {
    showWidget() {
      if (this.isClosed) {
        return;
      }

      this.clearRevealTimer();
      this.killActiveTimeline();
      this.isVisible = true;

      this.$nextTick(() => {
        const widget = this.$refs.widget;
        const bubble = this.$refs.bubble;

        if (!widget || !bubble) {
          return;
        }

        this.activeTimeline = gsap.timeline({
          defaults: {
            ease: 'power3.out',
          },
        });

        this.activeTimeline
          .fromTo(
            widget,
            {
              autoAlpha: 0,
              x: HIDDEN_X,
              y: HIDDEN_Y,
              pointerEvents: 'none',
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: REVEAL_DURATION_SECONDS,
              pointerEvents: 'auto',
              clearProps: 'opacity,visibility,transform,pointerEvents',
            },
          )
          .fromTo(
            bubble,
            {
              autoAlpha: 0,
              x: 24,
              scale: 0.96,
            },
            {
              autoAlpha: 1,
              x: 0,
              scale: 1,
              duration: 0.42,
              clearProps: 'opacity,visibility,transform',
            },
            '-=0.2',
          );
      });
    },
    hideWidget() {
      this.clearRevealTimer();
      this.killActiveTimeline();

      if (this.isClosed) {
        return;
      }

      const widget = this.$refs.widget;
      const bubble = this.$refs.bubble;

      if (!widget || !bubble || !this.isVisible) {
        this.isVisible = false;
        this.isClosed = true;
        return;
      }

      this.activeTimeline = gsap.timeline({
        defaults: {
          ease: 'power3.inOut',
        },
        onComplete: () => {
          this.isVisible = false;
          this.isClosed = true;
          gsap.set([widget, bubble], {
            clearProps: 'opacity,visibility,transform,pointerEvents',
          });
        },
      });

      this.activeTimeline
        .to(bubble, {
          autoAlpha: 0,
          x: 18,
          scale: 0.96,
          duration: 0.22,
        })
        .to(
          widget,
          {
            autoAlpha: 0,
            x: HIDDEN_X,
            y: HIDDEN_Y,
            duration: EXIT_DURATION_SECONDS,
            pointerEvents: 'none',
          },
          '-=0.04',
        );
    },
    clearRevealTimer() {
      if (!this.revealTimerId) {
        return;
      }

      window.clearTimeout(this.revealTimerId);
      this.revealTimerId = 0;
    },
    killActiveTimeline() {
      if (!this.activeTimeline) {
        return;
      }

      this.activeTimeline.kill();
      this.activeTimeline = null;
    },
  },
};
</script>

<style scoped>
.assistant-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  gap: 14px;
  max-width: calc(100vw - 32px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate3d(260px, 56px, 0);
  transform-origin: 100% 100%;
  will-change: opacity, transform;
}

.assistant-widget--visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate3d(0, 0, 0);
}

.assistant-widget__bubble {
  position: relative;
  width: min(238px, 44vw);
  margin: 0 0 42px;
  padding: 16px 18px;
  border: 1px solid rgb(37 99 235 / 16%);
  border-radius: 22px 22px 8px;
  color: #172033;
  background: rgb(255 255 255 / 94%);
  box-shadow: 0 20px 55px rgb(15 23 42 / 20%);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.3;
  backdrop-filter: blur(14px);
}

.assistant-widget__bubble::after {
  content: '';
  position: absolute;
  right: -10px;
  bottom: 20px;
  width: 20px;
  height: 20px;
  border-right: 1px solid rgb(37 99 235 / 16%);
  border-bottom: 1px solid rgb(37 99 235 / 16%);
  background: rgb(255 255 255 / 94%);
  transform: rotate(-45deg);
}

.assistant-widget__character-wrap {
  position: relative;
  flex: 0 0 auto;
}

.assistant-widget__stage {
  position: relative;
  width: clamp(188px, 24vw, 280px);
  min-height: clamp(228px, 29.2vw, 340px);
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 64%);
  border-radius: 30px;
  background: #e0f2fe;
  box-shadow: 0 26px 64px rgb(15 23 42 / 24%);
  isolation: isolate;
}

.assistant-widget__stage::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(circle at 50% 18%, rgb(255 255 255 / 42%), transparent 28%),
    linear-gradient(180deg, rgb(255 255 255 / 0%), rgb(15 23 42 / 12%));
  pointer-events: none;
}

.assistant-widget__stage :deep(.color-tile-background) {
  opacity: 0.82;
}

.assistant-widget__stage :deep(.dragonbones-canvas) {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: auto;
  min-height: inherit;
}

.assistant-widget__close {
  position: absolute;
  top: 18px;
  right: -10px;
  z-index: 4;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 0;
  border-radius: 999px;
  padding: 0;
  color: #0f172a;
  background: rgb(255 255 255 / 95%);
  box-shadow: 0 12px 30px rgb(15 23 42 / 24%);
  font: inherit;
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    color 180ms ease;
}

.assistant-widget__close:hover,
.assistant-widget__close:focus-visible {
  color: #ffffff;
  background: #2563eb;
  transform: scale(1.08);
  outline: none;
}

@media (max-width: 640px) {
  .assistant-widget {
    right: 12px;
    bottom: 12px;
    gap: 8px;
    max-width: calc(100vw - 20px);
  }

  .assistant-widget__bubble {
    width: min(170px, 50vw);
    margin-bottom: 28px;
    padding: 13px 14px;
    border-radius: 18px 18px 8px;
    font-size: 13px;
  }

  .assistant-widget__stage {
    width: clamp(142px, 42vw, 188px);
    min-height: clamp(172px, 51vw, 228px);
    border-radius: 24px;
  }

  .assistant-widget__close {
    top: 12px;
    right: -6px;
    width: 28px;
    height: 28px;
    font-size: 18px;
  }
}
</style>
