<template>
  <div id="app" :class="getUiTheme()">
    <header>
      <router-link to="/"><img class="logo" src="./assets/crumb-master.png" /></router-link>

      <button class="fill" @click="showModal('settings')"><i class="fas fa-cog"></i></button>
    </header>

    <div class="view-wrapper container">
      <router-view></router-view>
    </div>

    <modal name="settings" heading="Settings">
      <div class="row">
        <div class="col-12">
          <p>Spooky Mode:</p>
          <toggle
            v-model="isSpooky"
            :checked="isSpooky"
            >
          </toggle>
        </div>
      </div>
    </modal>
    <modal-backdrop></modal-backdrop>

    <footer>Made by <a href="https://github.com/djragsdale">@djragsdale</a> & <a href="https://github.com/swcolegrove">@swcolegrove</a></footer>
  </div>
</template>

<script>
import components from './components';
import { EventBus } from './util/EventBus.js';
import utils from './util/utils.js';
const { isNullOrUndefined, toBoolean } = utils;

export default {
  name: 'app',
  components,
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
    setTheme(isSpooky) {
      this.isSpooky = isSpooky;
      localStorage.isSpooky = isSpooky;
    },
    showModal(modalName) {
      EventBus.$emit('showModal', modalName);
    }
  },
  mounted() {
    this.getSpooky();

    EventBus.$on('theme:change', isSpooky => {
      this.setTheme(isSpooky);
    });
  },
}
</script>

<style lang="scss">
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
    flex: 1;
  }
</style>
