<template>
  <table class="vote-list">
    <thead>
      <tr>
        <td>Player</td>
        <td>Points</td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="vote in votes" :key="vote.playerName">
        <td>{{ vote.playerName }}</td>
        <td
          class="vote-value"
          :class="{ 'hide-vote': !showVotes }"
        >
          <transition name="flash" mode="out-in">
            <div :key="vote.value">{{ showVotes ? vote.value || '-' : (vote.value === '-') ? '-' : '✓' }}</div>
          </transition>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'VoteList',
  props: {
    showVotes: Boolean,
    votes: Array,
  },
};
</script>

<style lang="scss" scoped>
.vote-list {
  width: 50%;

  thead {
    font-weight: bold;
  }

  .hide-vote {
    background: #000;
  }
}

.vote-value {
  padding-left: 5px;
}

.flash-enter-active {
  transition: all .3s ease;
}
.flash-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.flash-enter, .flash-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

.flash-enter-active {
  background-color: $ui-color-action;
  -webkit-animation: flash linear .3s infinite;
  animation: flash linear .3s infinite;
}

.flash-leave-active {
  background-color: $ui-color-action;
  -webkit-animation: flash linear .3s infinite;
  animation: flash linear .3s infinite;
}

@-webkit-keyframes flash-in {
  0% { opacity: 1; }
  50% { opacity: .1; }
  100% { opacity: 1; }
}
@keyframes flash-in {
  0% { opacity: 1; }
  50% { opacity: .1; }
  100% { opacity: 1; }
}
</style>
