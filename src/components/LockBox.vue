<template>
  <div class="lock-box">
    <input type="checkbox" id="lock" :checked="checked" @change="changeEvent" v-on:input="$emit('input', $event.target.checked)" />
    <label for="lock"><i></i></label>
    {{ text }}
  </div>
</template>

<script>
export default {
  name: 'LockBox',
  props: {
    text: {
      type: String,
    },
    checked: {
      type: Boolean,
      required: true,
    },
    changeEvent: {
      type: Function,
    },
  }
};
</script>

<style lang="scss" scoped>
.lock-box {
  display: flex;
  align-items: center;

  input {
    display: none;
  }

  label {
    margin-right: 1rem;
  }

  i {
    margin-left: 0;
  }

  input[type="checkbox"] + label {
    display: block;
    margin-top: 9px;
    position: relative;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  input[type="checkbox"] + label:before {
    content: '';
    display: block;
    width: 14px;
    height: 8px;
    border-radius: 15px 15px 0 0;
    border: solid $ui-color-success;
    border-width: 3px 3px 0 3px;
    position: absolute;
    left: 3px;
    top: -9px;
    -webkit-transform-origin: 1px 100%;
    -ms-transform-origin: 1px 100%;
    transform-origin: 1px 100%;
    -webkit-transform: rotateY(180deg);
    transform: rotateY(180deg);
    -webkit-transition: all .12s;
    transition: all .12s;
  }

  input[type="checkbox"] + label i {
    display: inline-block;
    vertical-align: top;
    width: 20px;
    height: 15px;
    background: $ui-color-success;
    position: relative;
    -webkit-transition: all .12s;
    transition: all .12s;
  }

  input[type="checkbox"] + label i:before {
    content: '';
    display: block;
    width: 4px;
    height: 4px;
    background: $black;
    border-radius: 50%;
    position: absolute;
    top: 4px;
    left: 50%;
    margin-left: -2px;
  }
  input[type="checkbox"] + label i:after {
    content: '';
    display: block;
    width: 2px;
    height: 4px;
    background: $black;
    border-radius: 0 0 50% 50%;
    position: absolute;
    top: 7px;
    left: 50%;
    margin-left: -1px;
  }

  input[type="checkbox"]:checked + label i {
    background: $ui-color-danger;
  }

  input[type="checkbox"]:checked + label:before {
    border-color: $ui-color-danger;
    -webkit-transform: rotateY(0);
    transform: rotateY(0);
  }
}
</style>

<docs lang="markdown">
