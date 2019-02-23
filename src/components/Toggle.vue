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
  @import "./styles/index.scss";
  .toggle-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .toggle-label {

  }

  label {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;

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
      border-radius: 34px;
    }

    .toggle::before {
      position: absolute;
      content: '';
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      -webkit-transition: .4s;
      transition: .4s;
      border-radius: 50%;
    }

    input:focus + .toggle {
      box-shadow: 0 0 1px $ui-color-action;
    }

    input:checked + .toggle:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }

    input:checked + .toggle {
      background-color: $ui-color-action;
    }
  }

</style>
