<template>
  <div class="toggle-wrapper">
    <span class="toggle-label">{{ label }}</span>
    <label>
      <input type="checkbox" :checked="checked"
        v-on:input="$emit('input', $event.target.checked)">
      <span class="toggle"></span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'Toggle',
  props: {
    checked: {
      type: Boolean,
      required: true,
    },
    label: {
      type: String,
    }
  }
}
</script>

<style lang="scss" scoped>
  .toggle-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  label {
    position: relative;
    display: inline-block;
    width: 4rem;
    height: 2rem;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: .4s;
      transition: .4s;
      border-radius: 2rem;
    }

    .toggle::before {
      position: absolute;
      content: '';
      height: 1.5rem;
      width: 1.5rem;
      left: .25rem;
      bottom: .25rem;
      background-color: white;
      -webkit-transition: .4s;
      transition: .4s;
      border-radius: 50%;
    }

    input:focus + .toggle {
      box-shadow: 0 0 1px $ui-color-action;
    }

    input:checked + .toggle:before {
      -webkit-transform: translateX(2rem);
      -ms-transform: translateX(2rem);
      transform: translateX(2rem);
    }

    input:checked + .toggle {
      background-color: $ui-color-action;
    }
  }

</style>
