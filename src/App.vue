<template>
  <div class="space-landing">
    <AnimatedCharacter show-animation-controls />
  </div>
</template>

<script>
import AnimatedCharacter from './features/animated-character/AnimatedCharacter.vue';

export default {
  name: 'App',
  components: {
    AnimatedCharacter,
  },
};
</script>
