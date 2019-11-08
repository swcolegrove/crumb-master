<template>
  <transition
    name="slide"
  >
    <div
      v-if="isRunning"
      class="running-turkey"
    >
      <span
        v-for="(emoji, idx) in emojiCount"
        :key="idx"
        v-bind:style="getRandomTurkeyPosition()"
        class="turkey"
      >
        🦃
      </span>
    </div>
  </transition>
</template>

<script>
import { EventBus } from '../util/EventBus';

export default {
  name: 'TurkeyRun',
  data() {
    return {
      isRunning: false,
    };
  },
  computed: {
    emojiCount: () => (Math.floor(Math.random() * 1000) + 100),
  },
  mounted() {
    const RUN_SPEED = 1000;

    EventBus.$on('turkey-run:start', () => {
      console.log('turkey run starting'); // eslint-disable-line
      this.isRunning = true;

      setTimeout(() => { this.isRunning = false; }, RUN_SPEED);
    });
  },
  methods: {
    getRandomTurkeyPosition: () => {
      const left = Math.floor(Math.random() * window.innerWidth);
      const top = Math.floor(Math.random() * window.innerHeight);

      return {
        left: `${left}px`,
        top: `${top}px`,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
  .running-turkey {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    .turkey {
      position: relative;
    }
  }

  .slide-leave-active,
  .slide-enter-active {
    transition: 3s;
  }
  .slide-enter {
    transform: translate(100%, 0);
  }
  .slide-leave-to {
    transform: translate(-100%, 0);
  }
</style>
