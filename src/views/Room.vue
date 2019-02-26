<template>
  <main>
    <div class="room-info">Room Link: <input type="text" ref="inputCopyLink" :value="roomLink" readonly="true"/> <i @click="copyId" class="fas fa-copy"></i></div>
    <div class="player-info"><h2>{{ playerName }}</h2></div>
    <div class="story-info">
      <label>
        Story Description:
        <textarea v-model="storyText"></textarea>
      </label>
    </div>
    <div class="vote-controls">
      <button class="glow" @click="clearVotes">Clear Votes</button>
      <button class="fill" @click="toggleShowVotes()">Show Votes</button>
      <button class="diagonal" @click="makeMeCrumbMaster"><i class="fas fa-crown"></i> I am the Crumb Master!</button>
    </div>

    <timer :room-id="roomId"></timer>

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
import voteOptions from '../defaultVoteOptions';
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
      playerId: '7',
      playerName: '',
      roomLink: '',
      roomName: '',
      showVotes: false,
      storyText: '',
      storyTextIsDirty: false,
      voteOptions,
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
      console.log('The room just updated', newRoomData);
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
  watch: {
    storyText() {
      this.storyTextIsDirty = true;
      this.debounceStorySyncing();
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
    debounceStorySyncing: _.debounce(function debounceStorySyncing() {
      this.storyTextIsDirty = false;
      socket.emit('room story update', { roomId: this.roomId, story: this.storyText });
    }),
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

i {
  margin-left: 1rem;
  cursor: pointer;
}

label {
  display: flex;
  flex-direction: column;
}
</style>
