<template>
  <main>
    <div v-if="!isSet">
      <span class="dat-space">Enter your username to get started:</span>
      <div class="row">
        <div class="col-12">
          <input class="dat-space" type="text" v-model="username">
          <button class="diagonal dat-space" @click="setName">Set name</button>
        </div>
      </div>
    </div>
    <div v-else >
      <span class="dat-space">Create or join a room</span>
      <div class="row">
        <div class="col-12">
          <input type="text" placeholder="Room Name" v-model="roomName">
          <button class="diagonal dat-space" @click="createRoom">Create room</button>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          Past rooms:

        </div>
      </div>
    </div>
  </main>
</template>

<script>
import UserSession from '../mixins/UserSession.js';
import axios from 'axios';

export default {
  name: 'Home',
  mixins: [UserSession],
  data() {
    return {
      username: '',
      isSet: false,
      roomName: '',
    };
  },
  methods: {
    setName() {
      this.setUsername(this.username);
      this.isSet = true;
    },
    createRoom() {
      const roomName = this.roomName;
      const username = this.getUsername();
      axios.post('/create-room', { roomName, username } ).then((response) => {
        const roomId = response.data.roomId;
        this.$router.push({ path: `/room/${roomId}` });
      });
    },
  },
  mounted() {
    const name = this.getUsername();
    if (name) {
      this.isSet = true;
    }
  },
}
</script>

<style lang="scss" scoped>
  main {
    padding: 2rem;
  }

  .dat-space {
    margin: $pad-unit;
  }
</style>
