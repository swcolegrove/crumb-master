<template>
  <div class="swatch">
    <div class="swatch-tile white">$white</div>
    <div class="swatch-tile primary">$primary</div>
    <div class="swatch-tile primary-dk">$primary-dk</div>
    <div class="swatch-tile"></div>
    <div class="swatch-tile action">$action</div>
    <div class="swatch-tile action-dk">$action-dk</div>
    <div class="swatch-tile"></div>
    <div class="swatch-tile secondary">$secondary</div>
    <div class="swatch-tile secondary-dk">$secondary-dk</div>
    <div class="swatch-tile alert-lt">$alert-lt</div>
    <div class="swatch-tile alert">$alert</div>
    <div class="swatch-tile alert-dk">$alert-dk</div>
  </div>
</template>

<script>
export default {
  name: 'Swatch',
}
</script>

<style lang="scss">
  .swatch {
    border: 4px solid $black;
    background-color: $white;

    display: grid;
    grid-template-columns: [left-margin-start] 40px [light-column-start] 120px [main-column-start] 120px [dark-column-start] 40120pxpx [right-column-start] 40px [column-end];
    grid-template-rows: [top-margin-start] 40px [primary-row-start] 120px [action-row-start] 120px [secondary-row-start] 120px [alert-row-start] 120px [bottom-margin-start] 40px [row-end];
    grid-template-areas: 
      "top-margin top-margin top-margin top-margin top-margin"
      "left-margin white primary primary-dk right-margin"
      "left-margin action-empty action action-dk right-margin"
      "left-margin secondary-empty secondary secondary-dk right-margin"
      "left-margin alert-lt alert alert-dk right-margin"
      "bottom-margin bottom-margin bottom-margin bottom-margin bottom-margin";
  }

  .swatch-tile {
    background-color: transparent;
  }

  .primary {
    grid-area: primary;
    background-color: $primary;
  }
  .primary-dk {
    grid-area: primary-dk;
    background-color: $primary-dk;
    color: $white;
  }
  .white {
    grid-area: white;
    background-color: $white;
    border: 2px solid $black;
  }
  .action {
    grid-area: action;
    background-color: $action;
  }
  .action-dk {
    grid-area: action-dk;
    background-color: $action-dk;
    color: $white;
  }
  .secondary {
    grid-area: secondary;
    background-color: $secondary;
  }
  .secondary-dk {
    grid-area: secondary-dk;
    background-color: $secondary-dk;
    color: $white;
  }
  .alert-lt {
    grid-area: alert-lt;
    background-color: $alert-lt;
  }
  .alert {
    grid-area: alert;
    background-color: $alert;
  }
  .alert-dk {
    grid-area: alert-dk;
    background-color: $alert-dk;
    color: $white;
  }
</style>
