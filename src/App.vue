<template>
  <div id="app" :class="[getUiTheme(), { pyro: asplode }]">
    <autumn-leaves></autumn-leaves>
    <fireworks></fireworks>
    <turkey-run />
    <div class="before"></div>
    <header>
      <router-link to="/"><img class="logo" src="./assets/crumb-master.png" /></router-link>

      <button class="fill" @click="showModal('settings')"><i class="fas fa-cog"></i></button>
    </header>

    <div class="view-wrapper container">
      <router-view></router-view>
    </div>

    <modal name="settings" heading="Settings">
      <div class="row">
        <div class="col-12 mb-4">
          <p>Spooky Mode:</p>
          <toggle
            v-model="isSpooky"
            :checked="isSpooky"
            >
          </toggle>
        </div>
        <div class="col-12">
          <p>Username:</p>
          <input v-model="username" />
          <i @click="setName" class="fas fa-save btn-icon" title="save"></i>
        </div>
      </div>
    </modal>
    <modal-backdrop></modal-backdrop>

    <footer>Made by <a href="https://github.com/djragsdale">@djragsdale</a> & <a href="https://github.com/swcolegrove">@swcolegrove</a></footer>
    <div class="after"></div>
  </div>
</template>

<script>
import UserSession from './mixins/UserSession.js';
import components from './components';
import { EventBus } from './util/EventBus.js';
import utils from './util/utils.js';
const { isNullOrUndefined, toBoolean } = utils;

export default {
  name: 'app',
  mixins: [UserSession],
  components,
  data() {
    return {
      isSpooky: true,
      username: '',
      asplode: false,
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
    getFx() {
      const today = new Date();
      const month = today.getMonth();
      if (month === 6) { // July
        return { name: 'fireworks' };
      } else if (month === 9) { // October
        return { name: 'autumn-leaves', duration: 5000 };
      } else if (month === 10) {
        return { name: 'turkey-run' };
      }
      return { name: 'pyro' };
    },
    setTheme(isSpooky) {
      this.isSpooky = isSpooky;
      localStorage.isSpooky = isSpooky;
    },
    showModal(modalName) {
      EventBus.$emit('showModal', modalName);
    },
    setName() {
      this.setUsername(this.username);
      EventBus.$emit('username:change');
    },
  },
  mounted() {
    window.EventBus = EventBus;
    this.getSpooky();

    this.username = this.getUsername();

    EventBus.$on('theme:change', isSpooky => {
      this.setTheme(isSpooky);
    });

    EventBus.$on('username:change', () => {
      this.$router.go();
    });

    EventBus.$on('pyro:start', () => {
      this.asplode = true;
    });

    EventBus.$on('pyro:stop', () => {
      this.asplode = false;
    });

    EventBus.$on('fx:timed', milliseconds => {
      const { name, duration = milliseconds } = this.getFx();
      EventBus.$emit(`${name}:start`, true);
      setTimeout(() => {
        EventBus.$emit(`${name}:stop`, true);
      }, duration);
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
