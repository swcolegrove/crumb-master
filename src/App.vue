<template>
  <div id="app" :class="getUiTheme()">
    <header>
      <h1>Crumb Master</h1>
      <toggle
        v-model="isSpooky"
        :checked="isSpooky"
        label="Spooky Mode"
        >
      </toggle>
    </header>

    <div class="view-wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Toggle from './components/Toggle.vue';
import { isUndefined, toBoolean } from '../utils.js';

export default {
  name: 'app',
  components: {
    toggle: Toggle,
  },
  data() {
    return {
      isSpooky: true,
    };
  },
  methods: {
    getUiTheme() {
      return this.isSpooky ? 'dark' : 'light';
    },
    getSpooky() {
      const localSpooky = localStorage.getItem('isSpooky');
      if (!isUndefined(localSpooky)) {
        this.isSpooky = toBoolean(localSpooky);
      } else {
        localStorage.setItem('isSpooky', this.isSpooky);
      }
    },
  },
  mounted() {
    this.getSpooky();
  },
  watch: {
    isSpooky: (newVal) => {
      localStorage.isSpooky = newVal;
    },
  }
}
</script>

<style lang="scss">
  @import "@/styles/index.scss";

  #app {
    &.dark {
      background-color: $dark-theme-bg-secondary;
      color: $dark-theme-text-color;

      header {
        background-color: $dark-theme-bg-primary;
      }

      a {
        color: $ui-color-action;
      }
    }

    &.light {
      background-color: $light-theme-bg-secondary;
      color: $light-theme-text-color;

      header {
        background-color: $light-theme-bg-primary;
      }
    }
  }

  .view-wrapper {
    width: 100%;
    overflow: auto;
  }
</style>
