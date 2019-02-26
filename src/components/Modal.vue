<template>
  <div class="modal" v-if="showModal">
    <i class="fas fa-times close-modal" @click="closeModal"></i>
    <div class="row">
      <div class="col-12 modal-heading">
        <h3>{{ heading }}</h3>
      </div>
    </div>
    <slot />
  </div>
</template>

<script>
import { EventBus } from '../util/EventBus.js';

export default {
  name: 'Modal',
  props: {
    name: {
      type: String,
      required: true,
    },
    heading: {
      type: String,
    },
  },
  data() {
    return {
      showModal: false,
    };
  },
  mounted() {
    EventBus.$on('showModal', (modalName) => {
      if (modalName === this.name) {
        this.showModal = true;
      }
    });
    EventBus.$on('closeModal', () => {
      this.showModal = false;
    });
  },
  methods: {
    closeModal() {
      EventBus.$emit('closeModal');
    },
  },
};
</script>

<style lang="scss">
  .modal {
    position: relative;
    margin: 0 auto;
    min-width: 60%;
    min-height: 100px;
    z-index: $z-index-modal;
    padding: 1rem;
  }

  .dark .modal {
    background-color: $dark-theme-bg-thirdary;
  }

  .light .modal {
    background-color: $light-theme-bg-thirdary;
  }

  .close-modal {
    position: absolute;
    right: 1rem;
    top: 1rem;
    cursor: pointer;
    color: $ui-color-action;
    z-index: $z-index-modal;
  }
</style>
