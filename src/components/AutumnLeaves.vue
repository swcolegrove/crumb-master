<template>
  <div class="falling-leaves">
    <span v-for
  </div>
</template>

<script>
import { EventBus } from '../util/EventBus.js';

const dropInterval;

export default {
  name: 'Fireworks',
  props: {

  },
  data() {
    const leafCount = 30;

    return {
      dropFrequency: 2000 / leafCount, // Set base rate at 30 over 2s
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
      dropInterval = setInterval(dropLeaf, DROP_FREQUENCY);
    });

    EventBus.$on('autumn-leaves:stop', () => {
      console.log('autumn-leaves stopping'); // eslint-disable-line
      clearInterval(dropInterval);
    });

    EventBus.$on('autumn-leaves:faded', () => {
      console.log('autumn-leaves done and faded'); // eslint-disable-line
      this.leaves.length = 0;
    });

    function dropLeaf() {
      console.log('dropping another leaf');
    }
  },
  methods: {
    cleanLoops() {
      clearInterval(dropInterval);
      dropInterval = null;
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
      opacity: 1;
      transform: translate(0, 0) rotateZ(0deg);
    }
    75% {
      opacity: 1;
      transform: translate(100px, 600px) rotateZ(270deg);
    }
    100% {
      opacity: 0;
      transform: translate(150px, 800px) rotateZ(360deg);
    }
  }

  .falling-leaves {
    span {
      display: inline-block;
      width: 80px;
      height: 80px;
      margin: -280px 40px 54px -34px;

      background:url(“leaf.png”);

      -webkit-animation: fallingLeaves 10s infinite linear;
      -moz-animation: fallingLeaves 10s infinite linear;
      animation: fallingLeaves 10s infinite linear;

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
  }
</style>
