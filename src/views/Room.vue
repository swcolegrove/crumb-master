<template>
  <main>
    <div class="room-info">Room ID: <a href="#">{{ roomId }}</a></div>
    <div class="player-info"><h2>{{ playerName }}</h2></div>
    <div class="story-info">
      <label>
        Story Description:
        <textarea></textarea>
      </label>
    </div>
    <div class="vote-controls">
      <button class="glow" @click="clearVotes">Clear Votes</button>
      <button class="fill" @click="toggleShowVotes()">Show Votes</button>
      <button class="diagonal" @click="makeMeCrumbMaster">I am the Crumb Master!</button>
    </div>
    <div class="story-clock">
      Time: 00:12:34
    </div>
    <div class="vote-options">
      <button
        class="btn-vote"
        v-for="(voteOption, idx) in voteOptions"
        :key="idx"
        @click="castVote(voteOption.value)"
      >{{ voteOption.text }}</button>
    </div>
    <div class="vote-area">
      <vote-list :votes="votes" :show-votes="showVotes"></vote-list>
    </div>
    <div class="vote-summary">

    </div>
  </main>
</template>

<script>
import io from 'socket.io-client';
import UserSession from '../mixins/UserSession.js';
import VoteList from '../components/VoteList.vue';

const socket = io();

export default {
  name: 'Room',
  components: {
    'vote-list': VoteList,
  },
  mixins: [UserSession],
  data() {
    return {
      isCrumbMaster: false,
      isSpectator: false,
      playerId: '7',
      playerName: '',
      roomName: '',
      showVotes: false,
      voteOptions: [
        {
          text: '0 points',
          value: 0,
        },
        {
          text: '½ point',
          value: 0.5,
        },
        {
          text: '1 point',
          value: 1,
        },
        {
          text: '2 points',
          value: 2,
        },
        {
          text: '3 points',
          value: 3,
        },
        {
          text: '5 points',
          value: 5,
        },
        {
          text: '8 points',
          value: 8,
        },
        {
          text: '13 points',
          value: 13,
        },
        {
          text: '20 points',
          value: 20,
        },
        {
          text: '40 points',
          value: 40,
        },
        {
          text: '100 points',
          value: 100,
        },
        {
          text: '?',
          value: '?',
        },
      ],
      votes: [],
    };
  },
  mounted() {
    this.joinRoom();

    const name = this.getUsername();
    this.playerName = name;

    socket.on(`room ${this.roomId}`, (msg) => {
      this.roomName = msg['room-name'];
      delete msg['room-name'];
      this.votes = Object.entries(msg).map(([ playerName, value ]) => ({
        playerName,
        value,
      }));
    });
  },
  computed: {
    roomId() {
      return this.$route.params.roomId;
    },
  },
  methods: {
    castVote(value) {
      if (!this.isSpectator) {
        socket.emit('room vote', { roomId: this.roomId, username: this.playerName, value });
      }
    },
    clearVotes() {
      Object.keys(this.votes).forEach((key) => {
        if (this.votes.hasOwnProperty(key)) {
          // I'm worried about them not getting garbage collected
          this.votes[key] = null;
          delete this.votes[key];
        }
      });
    },
    makeMeCrumbMaster() {
      this.isCrumbMaster = true;
    },
    toggleShowVotes() {
      this.showVotes = !this.showVotes;
    },
    joinRoom() {
      const username = this.getUsername();
      this.playerName = username;
      const roomId = this.roomId;
      
      socket.emit('room join', { username, roomId });
    },
  },
}
</script>

<style lang="scss" scoped>
.room-info,
.player-info,
.story-info,
.vote-controls,
.story-clock,
.vote-options,
.vote-area {
  padding: $pad-unit;
}

.vote-options {
  padding-right: 0;
  padding-bottom: 0;
  width: 50%;

  .btn-vote {
    display: inline-block;
    margin-right: $pad-unit;
    margin-bottom: $pad-unit;
  }
}

.vote-controls button {
  margin-bottom: $pad-unit;
}
</style>
