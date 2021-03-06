<template>
  <main>
    <div class="room-info">
      Room Link: <input
        ref="inputCopyLink"
        type="text"
        :value="roomLink"
        readonly="true"
      > <i
        class="fas fa-copy btn-icon"
        @click="copyId"
      />
    </div>
    <div class="player-info">
      <h2>{{ playerName }}</h2>
    </div>
    <div class="story-info">
      <label>
        Story Description:
        <textarea v-model="storyText" />
      </label>
    </div>
    <div class="vote-controls">
      <button
        class="glow"
        @click="clearVotes"
      >
        Clear Votes
      </button>
      <button
        class="fill"
        @click="toggleShowVotes()"
      >
        {{ !showVotes ? 'Show Votes' : 'Hide Votes' }}
      </button>
      <!-- <button class="diagonal" @click="makeMeCrumbMaster"><i class="fas fa-crown"></i> I am the Crumb Master!</button> -->
    </div>

    <div class="row">
      <div class="col-6">
        <timer :room-id="roomId" />
      </div>
      <div class="col-6">
        <lock-box
          v-model="isLocked"
          text="Lock Votes"
          :checked="isLocked"
          :change-event="setVotingLock"
        />
      </div>
    </div>

    <div class="vote-options">
      <button
        v-for="(voteOption, idx) in voteOptions"
        :key="idx"
        class="btn-vote diagonal"
        :disabled="isLocked"
        @click="castVote(voteOption.value)"
      >
        {{ voteOption.text }}
      </button>
    </div>
    <div class="vote-area">
      <vote-list
        :votes="votes"
        :show-votes="showVotes"
      />
    </div>
    <div
      v-if="showVotes"
      class="vote-area"
    >
      <h3>Vote summary</h3>
      <p>
        Avg. Vote: <span class="blue">{{ getAvgVote }}</span>
      </p>
      <p>
        The most common vote was <span class="blue">{{ modeVotes.values }}</span> which was selected {{ modeVotes.count }} times out of {{ modeVotes.totalVotes }} votes
      </p>
    </div>
  </main>
</template>

<script>
import io from 'socket.io-client';
import axios from 'axios';
import * as debounce from 'lodash/debounce';
import components from '../components';
import voteOptions from '../defaultVoteOptions';
import UserSession from '../mixins/UserSession.js';
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
  computed: {
    getAvgVote() {
      const voteValues = this.filterVotes();
      if (voteValues.length) {
        return voteValues.reduce((val, total) => parseFloat(val) + parseFloat(total)) / voteValues.length;
      }
      return 0;
    },
    modeVotes() {
      const voteValues = this.filterVotes();
      if (voteValues.length) {
        const map = voteValues.reduce((map, item) => {
          if (!(item in map)) map[item] = 0;
          return map[item]++, map;
        }, {});
        const maxAppearenceValue = Math.max.apply(null, Object.values(map));
        const mostCommonValuesArr = [];
        Object.keys(map).forEach(key => {
          if (map[key] === maxAppearenceValue) mostCommonValuesArr.push(key);
        });

        return {
          values: mostCommonValuesArr.join(', '),
          count: maxAppearenceValue,
          totalVotes: voteValues.length,
        };
      }
      return {
        values: '?',
        count: '?',
        totalVotes: '?',
      };
    },
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
  beforeMount() {
    // 1. Check for user session
    // 2. If no user - bring to the home page
    const username = this.getUsername();
    if (!username) {
      const { roomId } = this.$route.params;
      this.$router.push({ path: '/', query: { roomId } });
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

      this.votes = Object.entries(newRoomData.votes).map(([playerName, value]) => ({
        playerName,
        value,
      }));

      this.checkForMatchedVotes();
    });


    socket.on(`room:${this.roomId}:setLock`, isLocked => {
      this.isLocked = isLocked;
    });

    socket.on(`room story ${this.roomId}`, ({ storyText }) => {
      this.storyText = storyText;
      // TODO: Is this triggering the watcher again?
    });
  },
  methods: {
    castVote(value) {
      if (!this.isSpectator) {
        axios.post('/cast-vote', { roomId: this.roomId, username: this.playerName, value }).then(() => {
          socket.emit('room:update', { roomId: this.roomId });
          if (
            !this.showVotes
            && !this.votes
              .filter(({ playerName }) => playerName !== this.playerName)
              .some(({ value }) => value === '-')
          ) {
            this.toggleShowVotes();
            // this.checkForMatchedVotes('castVote');
          }
        });
      }
    },
    checkForMatchedVotes() {
      const voteValues = this.votes
        .map(({ value }) => value)
        .filter(value => value !== '?');
      const uniqueVoteValues = [...new Set(voteValues)];
      if (uniqueVoteValues.length === 1 && uniqueVoteValues[0] !== '-') {
        EventBus.$emit('fx:timed', 2500);
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
    filterVotes() {
      return this.votes.map(vote => vote.value)
        .filter(val => !isNaN(val));
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
        const { roomId } = this;
        axios.post('/join-room', { username, roomId }).then(response => {
          this.setPastRoom(roomId, response.data.roomData.roomName);
          this.storyText = response.data.roomData.storyText;
          socket.emit('room:joined', { username, roomId });
          socket.emit('room:update', { roomId: this.roomId });
        });
      }
    },
    updateRoom() {
      axios.post('/update-room-name', { roomId: this.roomId, roomName: this.roomName }).then(() => {
        socket.emit('room:update', { roomId: this.roomId });
      });
    },
  },
};
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

span.blue {
  color: $ui-color-action;
}
</style>
