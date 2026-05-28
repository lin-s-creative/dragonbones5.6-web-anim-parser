<template>
  <canvas
    ref="canvas"
    class="dragonbones-canvas"
    :width="width"
    :height="height"
    :style="shadowStyle"
    :aria-label="ariaLabel"
    @click="handleCanvasClick"
  ></canvas>
</template>

<script>
import skeletonData from '../assets/ai_assistant_anim_ske.json';
import atlasData from '../assets/ai_assistant_anim_tex.json';
import atlasImageUrl from '../assets/ai_assistant_anim_tex.png';
import { parseDragonBonesProject } from '../runtime/parseDragonBones.js';
import { buildPose } from '../runtime/transform.js';
import { getDragonBonesHitItem, renderDragonBonesCanvas } from '../runtime/renderCanvas.js';

export default {
  name: 'DragonBonesCanvas',
  props: {
    armatureName: {
      type: String,
      default: 'Armature',
    },
    animationName: {
      type: String,
      default: 'animtion0',
    },
    width: {
      type: Number,
      default: 420,
    },
    height: {
      type: Number,
      default: 500,
    },
    scale: {
      type: Number,
      default: 0.5,
    },
    offsetX: {
      type: Number,
      default: 100,
    },
    offsetY: {
      type: Number,
      default: 100,
    },
    autoPlay: {
      type: Boolean,
      default: true,
    },
    backgroundColor: {
      type: String,
      default: 'transparent',
    },
    ariaLabel: {
      type: String,
      default: 'DragonBones canvas animation',
    },
    shadowStyle: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      project: null,
      image: null,
      isPlaying: false,
      elapsedSeconds: 0,
      startedAt: 0,
      stoppedAt: 0,
      rafId: 0,
    };
  },
  watch: {
    armatureName() {
      this.rebuildProject();
    },
    animationName() {
      this.resetAnimation();
      if (this.autoPlay) {
        this.playAnimation();
      }
    },
    width() {
      this.drawCurrentFrame();
    },
    height() {
      this.drawCurrentFrame();
    },
    scale() {
      this.drawCurrentFrame();
    },
    offsetX() {
      this.drawCurrentFrame();
    },
    offsetY() {
      this.drawCurrentFrame();
    },
    backgroundColor() {
      this.drawCurrentFrame();
    },
    autoPlay(value) {
      if (value) {
        this.playAnimation();
      } else {
        this.stopAnimation();
      }
    },
  },
  mounted() {
    this.rebuildProject();
    this.loadImage()
      .then(() => {
        this.drawCurrentFrame();

        if (this.autoPlay) {
          this.playAnimation();
        }
      })
      .catch((error) => {
        console.error('Cannot load DragonBones atlas image.', error);
      });
  },
  beforeUnmount() {
    this.stopAnimation();
  },
  methods: {
    playAnimation(animationName = this.animationName) {
      if (animationName !== this.animationName) {
        this.$emit('update:animationName', animationName);
      }

      if (!this.project || !this.image || this.isPlaying) {
        return;
      }

      this.isPlaying = true;
      this.startedAt = performance.now() - this.elapsedSeconds * 1000;
      this.tick();
    },
    stopAnimation() {
      if (!this.isPlaying) {
        return;
      }

      this.isPlaying = false;
      this.stoppedAt = this.elapsedSeconds;

      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }
    },
    resetAnimation() {
      this.elapsedSeconds = 0;
      this.startedAt = performance.now();
      this.drawCurrentFrame();
    },
    rebuildProject() {
      this.project = parseDragonBonesProject(skeletonData, atlasData, this.armatureName);
      this.resetAnimation();
    },
    loadImage() {
      if (this.image) {
        return Promise.resolve(this.image);
      }

      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          this.image = image;
          resolve(image);
        };
        image.onerror = reject;
        image.src = atlasImageUrl;
      });
    },
    tick() {
      if (!this.isPlaying) {
        return;
      }

      this.elapsedSeconds = (performance.now() - this.startedAt) / 1000;
      this.drawCurrentFrame();
      this.rafId = requestAnimationFrame(this.tick);
    },
    drawCurrentFrame() {
      if (!this.project || !this.image || !this.$refs.canvas) {
        return;
      }

      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      const pose = this.getCurrentPose();

      renderDragonBonesCanvas(ctx, this.project, pose, this.image, {
        width: this.width,
        height: this.height,
        scale: this.scale,
        backgroundColor: this.backgroundColor,
        ...this.getCanvasTransformOptions(),
      });
    },
    getCurrentPose() {
      return buildPose(this.project, this.animationName, this.elapsedSeconds);
    },
    getCanvasTransformOptions() {
      return {
        offsetX: this.width / 2 + this.offsetX,
        offsetY: this.height * 0.82 + this.offsetY,
      };
    },
    handleCanvasClick(event) {
      if (!this.project || !this.image || !this.$refs.canvas) {
        return;
      }

      const canvas = this.$refs.canvas;
      const rect = canvas.getBoundingClientRect();
      const point = {
        x: ((event.clientX - rect.left) / rect.width) * this.width,
        y: ((event.clientY - rect.top) / rect.height) * this.height,
      };
      const hitItem = getDragonBonesHitItem(
        this.project,
        this.getCurrentPose(),
        point,
        {
          width: this.width,
          height: this.height,
          scale: this.scale,
          ...this.getCanvasTransformOptions(),
        },
      );

      if (!hitItem) {
        return;
      }

      this.$emit('object-click', {
        displayName: hitItem.item.displayName,
        slotName: hitItem.item.slotName,
        boneName: hitItem.item.boneName,
        canvasX: Math.round(point.x),
        canvasY: Math.round(point.y),
      });
    },
  },
};
</script>

<style scoped>
.dragonbones-canvas {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>
