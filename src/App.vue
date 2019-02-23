<template>
  <div id="app" :class="getUiTheme()">
    <header>
      <h1>Crumb Master</h1>
      <toggle
        v-model="isSpooky"
        :checked="isSpooky"
        label="Spooky Mode"
        >
      </toggle>
    </header>

    <div class="wrapper">
      <div class="row">
        <div class="col-12">
          <input type="text" placeholder="Name"/>
          <button>Set name</button>
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
  </div>
</template>

<script>
import Toggle from './components/Toggle.vue'
import axios from 'axios';
import io from 'socket.io-client';
import { isUndefined, toBoolean } from '../utils.js';
const socket = io();

export default {
  name: 'app',
  components: {
    toggle: Toggle,
  },
  data() {
    return {
      typingText: '',
      messages: [],
      isSpooky: true,
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
    getUiTheme() {
      return this.isSpooky ? 'dark' : 'light';
    },
    incomingMessage(msg) {
      this.messages.push(msg);
    },
    getMessages() {
      axios.get('/messages').then((response) => {
        this.messages = response.data;
      });
    },
    getSpooky() {
      const localSpooky = localStorage.getItem('isSpooky');
      if (!isUndefined(localSpooky)) {
        this.isSpooky = toBoolean(localSpooky);
      } else {
        localStorage.setItem('isSpooky', this.isSpooky);
      }
    },
  },
  mounted() {
    this.getSpooky();
    this.getMessages();
    socket.on('chat message', (msg) => {
      this.incomingMessage(msg);
    });
  },
  watch: {
    isSpooky: (newVal) => {
      localStorage.isSpooky = newVal;
    },
  }
}
</script>

<style lang="scss">
  @import "./styles/index.scss";

  #app {
    &.dark {
      background-color: $dark-theme-bg-secondary;
      color: $dark-theme-text-color;

      header {
        background-color: $dark-theme-bg-primary;
      }
    }

    &.light {
      background-color: $light-theme-bg-secondary;
      color: $light-theme-text-color;

      header {
        background-color: $light-theme-bg-primary;
      }
    }
  }

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
    background: rgb(130, 224, 255);
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
  }
</style>
