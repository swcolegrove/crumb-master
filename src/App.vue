<template>
  <div id="app" :class="getUiTheme()">
    <header>
      <h1>Crumb Master</h1>
    </header>

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
import axios from 'axios';
import io from "socket.io-client";
const socket = io();

export default {
  name: 'app',
  data() {
    return {
      typingText: '',
      messages: [],
      themeColor: 'dark',
    };
  },
  methods: {
    chatSubmit: function() {
      const message = this.typingText;
      axios.post('/sendMessage', { message } ).then(() => {
        socket.emit('chat message', message);
        this.typingText = '';
      });
    },
    getUiTheme() {
      return this.themeColor;
    },
    incomingMessage: function(msg) {
      this.messages.push(msg);
    },
    getMessages() {
      axios.get('/messages').then((response) => {
        this.messages = response.data;
      });
    },
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
  $ui-theme-primary: #0C0C0D;
  $ui-theme-secondary: #323234;
  $ui-theme-thirdary: #474749;

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    height: 100%;
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;

    &.dark {
      background-color: $ui-theme-secondary;
      color: #fff;

      header {
        background-color: $ui-theme-primary;
      }
    }

    &.light {

    }
  }

  header {
    padding: 10px;
  }

  form {
    /* background: #000; */
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
    background-color: $ui-theme-thirdary;
  }
</style>
