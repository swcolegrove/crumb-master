<template>
  <main>
    <div v-if="!isSet">
      Enter your username:
      <div class="row">
        <div class="col-12">
          <input type="text" v-model="username">
          <button class="glow" @click="setName">Set name</button>
        </div>
      </div>
    </div>
    <div v-else >
      Create or join a room
      <div class="row">
        <div class="col-12">
          <button class="glow" @click="createRoom">Create room</button>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <input type="text" v-model="roomName">
          <button class="glow">Join room</button>
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
      const name = this.getUsername();
      axios.post('/create-room', { name } ).then((response) => {
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
</style>
