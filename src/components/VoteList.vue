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
        <td :class="{ 'hide-vote': !showVotes }">{{ showVotes ? vote.value || '-' : '-' }}</td>
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
}
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
</style>