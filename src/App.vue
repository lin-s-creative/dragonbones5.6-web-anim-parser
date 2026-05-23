<template>
  <main class="demo-page">
    <section class="demo-card">
      <DragonBonesCanvas
        ref="dragonBones"
        :width="420"
        :height="500"
        :scale="0.3"
        :offset-x="offsetX"
        :offset-y="offsetY"
        armature-name="Armature"
        animation-name="animtion0"
        background-color="#f8fafc"
      />

      <div class="controls">
        <button type="button" @click="playAnimation">Play</button>
        <button type="button" @click="stopAnimation">Stop</button>
        <button type="button" @click="resetAnimation">Reset</button>
      </div>

      <div class="movement-controls" aria-label="Canvas position controls">
        <label class="movement-field">
          <span>Offset X</span>
          <input
            v-model.number="offsetX"
            type="number"
            step="5"
            min="-300"
            max="300"
          />
        </label>

        <label class="movement-field">
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

export default {
  name: 'App',
  components: {
    DragonBonesCanvas,
  },
  data() {
    return {
      offsetX: 0,
      offsetY: 0,
    };
  },
  methods: {
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
