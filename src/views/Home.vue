<template>
  <main>
    <div v-if="!usernameIsSet">
      <span class="dat-space">Enter your username to get started:</span>
      <div class="row">
        <div class="col-12">
          <input
            v-model="username"
            class="dat-space"
            type="text"
          >
          <button
            class="diagonal dat-space"
            @click="setName"
          >
            Set name
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <span class="dat-space">Welcome, {{ username }}!</span>
      <span class="dat-space">Create or join a room</span>
      <div class="row">
        <div class="col-12">
          <input
            v-model="roomName"
            type="text"
            placeholder="Room Name"
          >
          <button
            class="diagonal dat-space"
            @click="createRoom"
          >
            Create room
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          Past rooms:
          <ul
            v-if="pastRooms && pastRooms.length > 0"
            class="past-rooms"
          >
            <li
              v-for="(room, roomKey) in pastRooms"
              :key="roomKey"
            >
              <router-link :to="`/room/${room.id}`">
                {{ room.name }}
              </router-link>
              <a
                class="remove-room"
                title="Remove"
                @click="removePastRoom(room)"
              > X </a>
            </li>
          </ul>
          <p v-else>
            😥 You don't have any rooms yet
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import UserSession from '../mixins/UserSession.js';

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
  mounted() {
    const name = this.getUsername();
    if (name) {
      this.usernameIsSet = true;
      this.username = name;
    }

    this.getPastRoomList();
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
      const { roomName, username } = this;
      axios.post('/create-room', { roomName, username }).then(response => {
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
      this.pastRooms = pastRooms.map(room => {
        const splitRoom = room.split('&&&');
        return {
          name: splitRoom[0],
          id: splitRoom[1],
        };
      });
    },
  },
};
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
