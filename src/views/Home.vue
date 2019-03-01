<template>
  <main>
    <div v-if="!usernameIsSet">
      <span class="dat-space">Enter your username to get started:</span>
      <div class="row">
        <div class="col-12">
          <input class="dat-space" type="text" v-model="username">
          <button class="diagonal dat-space" @click="setName">Set name</button>
        </div>
      </div>
    </div>
    <div v-else >
      <span class="dat-space">Welcome, {{ username }}!</span>
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
          <ul class="past-rooms" v-if="pastRooms && pastRooms.length > 0">
            <li v-for="(room, roomKey) in pastRooms" :key="roomKey">
              <router-link :to="`/room/${room.id}`">{{ room.name }}</router-link>
              <a class="remove-room" @click="removePastRoom(room)" title="Remove"> X </a>
            </li>
          </ul>
          <p v-else>😥 You don't have any rooms yet</p>
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
      pastRooms: [],
    };
  },
  methods: {
    setName() {
      this.setUsername(this.username);
      const roomQuery = this.$route.query.roomId;
      if (roomQuery) {
        this.$router.push({ path: `/room/${roomQuery}` });
      }
      this.usernameIsSet = true;
    },
    createRoom() {
      const roomName = this.roomName;
      const username = this.username;
      axios.post('/create-room', { roomName, username } ).then((response) => {
        const { roomId } = response.data.roomData;
        this.$router.push({ path: `/room/${roomId}` });
      });
    },
    removePastRoom(room) {
      let pastRooms = this.getPastRooms();
      const roomIndex = pastRooms.indexOf(`${room.name}&&&${room.id}`);
      pastRooms.splice(roomIndex, 1);
      pastRooms = JSON.stringify(pastRooms);
      localStorage.setItem('pastRooms', pastRooms);

      this.getPastRoomList();
    },
    getPastRoomList() {
      const pastRooms = this.getPastRooms();
      this.pastRooms = pastRooms.map((room) => {
        const splitRoom = room.split('&&&');
        return {
          name: splitRoom[0],
          id: splitRoom[1],
        };
      });
    },
  },
  mounted() {
    const name = this.getUsername();
    if (name) {
      this.usernameIsSet = true;
      this.username = name;
    }

    this.getPastRoomList();
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

  .past-rooms li {
    list-style-type: none;

    a.remove-room {
      color: $ui-color-danger;
      cursor: pointer;
    }
  }

  .row {
    margin-bottom: 1rem;
  }
</style>
