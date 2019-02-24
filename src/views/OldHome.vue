<template>
  <main>
    <div class="wrapper">
      <div class="row">
        <div class="col-12">
          <input type="text" placeholder="Name"/>
          <button>Set name</button>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <input type="text" placeholder="Room Name" v-model="roomName">
          <button class="glow" @click.native="createRoom">Create room</button>
        </div>
      </div>
    </div>

    <ul id="messages">
      <li v-for="(message, messageKey) in messages" :key="messageKey">
        {{ message }}
      </li>
    </ul>
    <form action="" v-on:submit.prevent="chatSubmit">
      <input id="m" autocomplete="off" v-model="typingText" /><button>Send</button>
    </form>
  </main>
</template>

<script>
import axios from 'axios';
import io from 'socket.io-client';

const socket = io();

export default {
  name: 'Home',
  data() {
    return {
      typingText: '',
      messages: [],
    };
  },
  methods: {
    chatSubmit() {
      const message = this.typingText;
      axios.post('/sendMessage', { message } ).then(() => {
        socket.emit('chat message', message);
        this.typingText = '';
      });
    },
    getMessages() {
      axios.get('/messages').then((response) => {
        this.messages = response.data;
      });
    },
    incomingMessage(msg) {
      this.messages.push(msg);
    },
    createRoom() {
      // axios.post('/createRoom', ({ roomName: this.roomName })).then(() => {
        this.$router.push({ path: `/room/${this.roomName}` });
      // });
    }
  },
  mounted() {
    this.getMessages();
    socket.on('chat message', (msg) => {
      this.incomingMessage(msg);
    });
  },
}
</script>

<style lang="scss">
  .wrapper {
    padding: 2rem;
  }

  //TODO: Remove this
  form {
    padding: 3px;
    position: fixed;
    bottom: 0;
    width: 100%;
  }

  form input {
    border: 0;
    padding: 10px;
    width: 90%;
    margin-right: .5%;
  }

  form button {
    width: 9%;
    border: none;
    padding: 10px;
  }

  #messages {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  #messages li {
    padding: 5px 10px;
  }

  #messages li:nth-child(odd) {
    background-color: $dark-theme-bg-thirdary;
    color: $light-theme-text-inverse;
  }
</style>
