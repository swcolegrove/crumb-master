<template>
  <div id="app" :class="getUiTheme()">
    <header>
      <router-link to="/"><img class="logo" src="./assets/crumb-master200.png" /></router-link>

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
import { isNullOrUndefined, toBoolean } from '../utils.js';

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
      if (!isNullOrUndefined(localSpooky)) {
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

  .logo {
    width: 50px;
  }

  #app {
    &.dark {
      background-color: $dark-theme-bg-secondary;
      color: $dark-theme-text-color;

      header {
        background-color: $dark-theme-bg-primary;
      }
    }

    &.light {
      background-color: $light-theme-bg-secondary;
      color: $light-theme-text-color;

      header {
        background-color: $light-theme-bg-primary;
        box-shadow: 0 1px 3px rgba(33,33,33,.2);
      }
    }
  }

  .view-wrapper {
    width: 100%;
    overflow: auto;
  }
</style>
