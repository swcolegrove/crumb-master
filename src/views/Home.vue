<template>
  <main>
    <div v-if="!usernameIsSet">
      <span class="dat-space">Enter your username:</span>
      <div class="row">
        <div class="col-12">
          <input class="dat-space" type="text" v-model="username">
          <button class="glow dat-space" @click="setName">Set name</button>
        </div>
      </div>
    </div>
    <div v-else >
      <span class="dat-space">Welcome, {{ username }}!</span>
      <span class="dat-space">Create or join a room</span>
      <div class="row">
        <div class="col-12">
          <button class="glow dat-space" @click="createRoom">Create room</button>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <input class="dat-space" type="text" v-model="roomName">
          <button class="glow dat-space">Join room</button>
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
      usernameIsSet: false,
      roomName: '',
    };
  },
  methods: {
    setName() {
      this.setUsername(this.username);
      this.usernameIsSet = true;
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
      this.usernameIsSet = true;
      this.username = name;
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

  input.dat-space {
    padding-left: 4px;
    padding-right: 4px;
  }
</style>
