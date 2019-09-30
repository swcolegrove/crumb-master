<template>
  <div
    :class="[{ 'is-fading': isFading }, 'falling-leaves']"
  >
    <span v-for="(leaf, idx) in leaves" :key="idx"></span>
  </div>
</template>

<script>
import { EventBus } from '../util/EventBus.js';

let dropInterval;

export default {
  name: 'AutumnLeaves',
  props: {
    dropFrequency: {
      type: Number,
      default: 2000 / 30, // Set base rate at 30 over 2s
    },
    fadeSpeed: {
      type: Number,
      default: 500,
    },
  },
  data() {
    return {
      isFading: false,
      leaves: [],
    };
  },
  mounted() {
    const DROP_FREQUENCY = this.dropFrequency;

    EventBus.$on('autumn-leaves:start', () => {
      console.log('autumn-leaves starting'); // eslint-disable-line
      if (dropInterval) {
        clearInterval(dropInterval);
      }
      dropInterval = setInterval(this.dropLeaf, DROP_FREQUENCY);
    });

    EventBus.$on('autumn-leaves:stop', () => {
      console.log('autumn-leaves stopping'); // eslint-disable-line
      clearInterval(dropInterval);

      this.isFading = true;
      setTimeout(() => {
        EventBus.$emit('autumn-leaves:faded');
      }, this.fadeSpeed);
    });

    EventBus.$on('autumn-leaves:faded', () => {
      console.log('autumn-leaves done and faded'); // eslint-disable-line
      this.isFading = false;
      this.leaves.length = 0;
    });
  },
  methods: {
    cleanLoops() {
      clearInterval(dropInterval);
      dropInterval = null;
    },
    dropLeaf() {
      console.log('dropping another leaf'); // eslint-disable-line

      this.leaves.push({});
    },
    fadeLeaves() {

    },
  },
  beforeDestroy() {
    this.cleanLoops();
  },
}
</script>

<style lang="scss">
  @keyframes fallingLeaves {
    0% {
      // opacity: 1;
      transform: translate(0, 0) rotateZ(0deg);
    }
    75% {
      // opacity: 1;
      transform: translate(100px, 600px) rotateZ(270deg);
    }
    100% {
      // opacity: 0;
      transform: translate(150px, 800px) rotateZ(360deg);
    }
  }

  .falling-leaves {
    position: absolute;

    span {
      display: inline-block;
      opacity: 1;
      width: 80px;
      height: 80px;
      margin: -280px 40px 54px -34px;

      background: url('../assets/leaf.png');

      -webkit-animation: fallingLeaves 6s infinite linear;
      -moz-animation: fallingLeaves 6s infinite linear;
      animation: fallingLeaves 6s infinite linear;
      transition: opacity .5s ease-out;

      &:nth-child(5n+5) {
        -webkit-animation-delay: 1s;
        -moz-animation-delay: 1s;
        animation-delay: 1s;
      }

      &:nth-child(3n+2) {
        -webkit-animation-delay: 1.5s;
        -moz-animation-delay: 1.5s;
        animation-delay: 1.5s;
      }

      &:nth-child(2n+5) {
        -webkit-animation-delay: 1.7s;
        -moz-animation-delay: 1.7s;
        animation-delay: 1.7s;
      }
    }

    &.is-fading {
      span {
        opacity: 0;
      }
    }
  }
</style>
