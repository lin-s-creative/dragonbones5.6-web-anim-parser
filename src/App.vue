<template>
  <div class="space-landing">
    <AnimatedCharacter show-animation-controls />

    <header class="space-hero section-panel">
      <p class="eyebrow">Orbit demo · Vue overlay</p>
      <h1>Build a mission control page while the animated assistant stays above the viewport.</h1>
      <p class="hero-copy">
        This long space-themed landing page is intentionally scrollable so the animation canvas and
        controls can be tested as a fixed overlay that remains pinned to the screen.
      </p>
      <div class="hero-actions">
        <a class="primary-link" href="#mission">Explore mission</a>
        <a class="ghost-link" href="#timeline">View timeline</a>
      </div>
    </header>

    <main class="landing-content" aria-label="Space landing page demo content">
      <section id="mission" class="section-panel mission-grid">
        <div>
          <p class="eyebrow">Mission</p>
          <h2>Persistent cockpit layer</h2>
          <p>
            Scroll through nebula cards, stats, and timeline sections. The assistant overlay uses
            viewport positioning, so the character and control panel stay available above every block.
          </p>
        </div>

        <div class="stats-grid" aria-label="Mission statistics">
          <article>
            <strong>24/7</strong>
            <span>Viewport presence</span>
          </article>
          <article>
            <strong>1000</strong>
            <span>Overlay z-index</span>
          </article>
          <article>
            <strong>0%</strong>
            <span>Scroll drift</span>
          </article>
        </div>
      </section>

      <section class="cards-row" aria-label="Space feature cards">
        <article class="feature-card">
          <span class="feature-icon">✦</span>
          <h3>Deep-space routing</h3>
          <p>Layered sections and glowing panels create real page depth behind the fixed controls.</p>
        </article>
        <article class="feature-card">
          <span class="feature-icon">◐</span>
          <h3>Orbital stability</h3>
          <p>The canvas position sliders target screen percentages rather than document coordinates.</p>
        </article>
        <article class="feature-card">
          <span class="feature-icon">☄</span>
          <h3>Interactive telemetry</h3>
          <p>Controls keep pointer events while the transparent overlay shell lets the page scroll.</p>
        </article>
      </section>

      <section id="timeline" class="section-panel timeline-section">
        <p class="eyebrow">Launch timeline</p>
        <h2>Scroll test route</h2>
        <div class="timeline-list">
          <article>
            <span>01</span>
            <div>
              <h3>Ignition</h3>
              <p>Open the app and confirm the assistant layer is visible above the hero section.</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Ascent</h3>
              <p>Scroll down the landing page and verify that canvas and controls do not move with content.</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Orbit</h3>
              <p>Use play, stop, reset, size, offset, and viewport sliders while staying on any scroll position.</p>
            </div>
          </article>
        </div>
      </section>

      <section class="section-panel final-callout">
        <p class="eyebrow">Ready for embedding</p>
        <h2>The animated component is now an app-level overlay.</h2>
        <p>
          It can be mounted once near the root of a Vue app and will sit above regular content,
          preserving its viewport location even when the document scrolls underneath.
        </p>
      </section>
    </main>
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
