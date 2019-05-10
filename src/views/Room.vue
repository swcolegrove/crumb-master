<template>
  <main>
    <div class="room-info">Room Link: <input type="text" ref="inputCopyLink" :value="roomLink" readonly="true"/> <i @click="copyId" class="fas fa-copy btn-icon"></i></div>
    <div class="player-info"><h2>{{ playerName }}</h2></div>
    <div class="story-info">
      <label>
        Story Description:
        <textarea v-model="storyText"></textarea>
      </label>
    </div>
    <div class="vote-controls">
      <button class="glow" @click="clearVotes">Clear Votes</button>
      <button class="fill" @click="toggleShowVotes()"> {{ !showVotes ? 'Show Votes' : 'Hide Votes' }}</button>
      <!-- <button class="diagonal" @click="makeMeCrumbMaster"><i class="fas fa-crown"></i> I am the Crumb Master!</button> -->
    </div>

    <div class="row">
      <div class="col-6">
        <timer :room-id="roomId"></timer>
      </div>
      <div class="col-6">
        <lock-box text="Lock Votes" v-model="isLocked" :checked="isLocked" :change-event="setVotingLock"></lock-box>
      </div>
    </div>

    <div class="vote-options">
      <button
        class="btn-vote diagonal"
        v-for="(voteOption, idx) in voteOptions"
        :key="idx"
        @click="castVote(voteOption.value)"
        :disabled="isLocked"
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
import * as debounce from 'lodash/debounce'
import { toBoolean } from '../util/utils.js';
import { EventBus } from '../util/EventBus.js';

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
      this.roomName = newRoomData.roomName;
      this.showVotes = toBoolean(newRoomData.showVotes);
      this.isLocked = toBoolean(newRoomData.isLocked);

      this.votes = Object.entries(newRoomData.votes).map(([ playerName, value ]) => ({
        playerName,
        value,
      }));
    });


    socket.on(`room:${this.roomId}:setLock`, (isLocked) => {
      this.isLocked = isLocked;
    });

    socket.on(`room story ${this.roomId}`, ({ storyText }) => {
      this.storyText = storyText;
      // TODO: Is this triggering the watcher again?
    });

    EventBus.$on('username:change', () => {
      this.$router.go();
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
        axios.post('/cast-vote', { roomId: this.roomId, username: this.playerName, value }).then(() => {
          socket.emit('room:update', { roomId: this.roomId });
          if (
            !this.showVotes &&
            !this.votes
              .filter(({ playerName }) => playerName !== this.playerName)
              .some(({ value }) => value === '-')
          ) {
            this.toggleShowVotes();

            const voteValues = this.votes.map(({ value }) => value);
            const uniqueVoteValues = [...new Set(voteValues)];
            if (uniqueVoteValues.length === 1) {
              console.log('votes all match', uniqueVoteValues); // eslint-disable-line
              EventBus.$emit('pyro:timed', 2000);
            } else {
              console.log('vote mismatch', uniqueVoteValues); // eslint-disable-line
            }
          }
        });
      }
    },
    clearVotes() {
      axios.post('/clear-votes', { roomId: this.roomId, username: this.playerName }).then(() => {
        socket.emit('room:update', { roomId: this.roomId });
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
    debounceStorySyncing: debounce(function debounceStorySyncing() {
      this.storyTextIsDirty = false;
      socket.emit('room story update', { roomId: this.roomId, storyText: this.storyText });
    }, 500),
    setVotingLock() {
      axios.post('set-lock', { roomId: this.roomId, isLocked: this.isLocked }).then(() => {
        socket.emit('room:update', { roomId: this.roomId });
      });
    },
    makeMeCrumbMaster() {
      this.isCrumbMaster = true;
    },
    toggleShowVotes() {
      const shouldShow = !this.showVotes;

      if (shouldShow) {
        this.isLocked = true;
        this.setVotingLock();
      }
      axios.post('set-vote-visibility', { roomId: this.roomId, showVotes: shouldShow }).then(() => {
        socket.emit('room:update', { roomId: this.roomId });
      });
    },
    joinRoom() {
      // TODO: If someone goes direct to a link with no room name - do we set a random one?
      const username = this.getUsername();
      if (username) {
        this.playerName = username;
        const roomId = this.roomId;
        axios.post('/join-room', { username, roomId } ).then((response) => {
          this.setPastRoom(roomId, response.data.roomData.roomName);
          this.storyText = response.data.roomData.storyText;
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

label {
  display: flex;
  flex-direction: column;
}
</style>
