<template>
  <main>
    <div class="room-info">Room Link: <input type="text" ref="inputCopyLink" :value="roomLink" readonly="true"/> <i @click="copyId" class="fas fa-copy"></i></div>
    <div class="player-info"><h2>{{ playerName }}</h2></div>
    <div class="story-info">
      <label>
        Story Description:
        <textarea></textarea>
      </label>
    </div>
    <div class="vote-controls">
      <button class="glow" @click="clearVotes">Clear Votes</button>
      <button class="fill" @click="toggleShowVotes()"> {{ !showVotes ? 'Show Votes' : 'Hide Votes' }}</button>
      <button class="diagonal" @click="makeMeCrumbMaster"><i class="fas fa-crown"></i> I am the Crumb Master!</button>
    </div>

    <div class="row">
      <div class="col-6">
        <timer :room-id="roomId"></timer>
      </div>
      <div class="col-6">
        <lock-box text="Lock Votes" v-model="isLocked" :checked="isLocked" :click-event="lockVotes"></lock-box>
      </div>
    </div>

    <div class="vote-options">
      <button
        class="btn-vote diagonal"
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
import components from '../components';
import io from 'socket.io-client';
import UserSession from '../mixins/UserSession.js';
import axios from 'axios';

const socket = io();

export default {
  name: 'Room',
  components,
  mixins: [UserSession],
  data() {
    return {
      isCrumbMaster: false,
      isSpectator: false,
      isLocked: false,
      playerId: '7',
      playerName: '',
      roomLink: '',
      roomName: '',
      showVotes: false,
      voteOptions: [
        {
          text: '0 points',
          value: '0',
        },
        {
          text: '½ point',
          value: '0.5',
        },
        {
          text: '1 point',
          value: '1',
        },
        {
          text: '2 points',
          value: '2',
        },
        {
          text: '3 points',
          value: '3',
        },
        {
          text: '5 points',
          value: '5',
        },
        {
          text: '8 points',
          value: '8',
        },
        {
          text: '13 points',
          value: '13',
        },
        {
          text: '20 points',
          value: '20',
        },
        {
          text: '40 points',
          value: '40',
        },
        {
          text: '100 points',
          value: '100',
        },
        {
          text: '?',
          value: '?',
        },
      ],
      votes: [],
    };
  },
  beforeMount() {
    // 1. Check for user session
    // 2. If no user - bring to the home page
    const username = this.getUsername();
    if (!username) {
      const roomId = this.$route.params.roomId;
      this.$router.push({ path: `/`, query: { roomId: roomId } });
    }
  },
  mounted() {
    this.joinRoom();

    const name = this.getUsername();
    this.playerName = name;
    this.roomLink = `${window.location.origin}/#${this.$route.path}`;

    socket.on(`room:${this.roomId}:changed`, newRoomData => {
      this.roomName = newRoomData['room-name'];
      delete newRoomData['room-name'];
      this.votes = Object.entries(newRoomData).map(([ playerName, value ]) => ({
        playerName,
        value,
      }));
    });

    socket.on(`room:${this.roomId}:showVotes change`, ({ votesAreShown }) => {
      this.showVotes = votesAreShown;
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
        axios.post('/cast-vote', { roomId: this.roomId, username: this.playerName, value } ).then(() => {
          socket.emit('room:update', { roomId: this.roomId });
        });
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
    copyId() {
      this.$refs.inputCopyLink.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        alert('You are using a bad browser. Stop that');
      }
    },
    lockVotes() {
      console.log(this.isLocked);
    },
    makeMeCrumbMaster() {
      this.isCrumbMaster = true;
    },
    toggleShowVotes() {
      // this.showVotes = !this.showVotes;
      socket.emit('show vote change', { roomId: this.roomId, votesAreShown: !this.showVotes });
    },
    joinRoom() {
      // TODO: If someone goes direct to a link with no room name - do we set a random one?
      const username = this.getUsername();
      if (username) {
        this.playerName = username;
        const roomId = this.roomId;
        axios.post('/join-room', { username, roomId } ).then((response) => {
          this.setPastRoom(roomId, response.data.roomData['room-name']);
          socket.emit('room:joined', { username, roomId });
          socket.emit('room:update', { roomId: this.roomId });
        });
      }
    },
    updateRoom() {
      axios.post('/update-room-name', { roomId: this.roomId, roomName: this.roomName}).then(() => {
        socket.emit('room:update', { roomId: this.roomId });
      });
    }
  },
}
</script>

<style lang="scss" scoped>
.room-info,
.player-info,
.story-info,
.vote-controls,
.vote-options,
.vote-area {
  padding: $pad-unit;
}

.vote-options {
  padding-right: 0;
  padding-bottom: 0;

  .btn-vote {
    display: inline-block;
    margin-right: $pad-unit;
    margin-bottom: $pad-unit;
  }
}

.vote-controls button {
  margin-bottom: $pad-unit;
}

i {
  margin-left: 1rem;
  cursor: pointer;
}

label {
  display: flex;
  flex-direction: column;
}
</style>
