<template>
  <table class="vote-list">
    <thead>
      <tr>
        <td>Player</td>
        <td>Points</td>
      </tr>
    </thead>
    <tbody>
      <tr  v-for="player in players" :key="player.id">
        <td>{{ player.name }}</td>
        <td :class="{ 'hide-vote': !showVotes }">{{ showVotes ? (getVote(player.id) || {}).value || '-' : '-' }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'VoteList',
  props: {
    players: Array,
    showVotes: Boolean,
    votes: Array,
  },
  methods: {
    getVote(playerId) {
      return this.votes.find(vote => vote.playerId === playerId);
    }
  }
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