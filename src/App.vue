<template>
  <div id="app">
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
import io from "socket.io-client";
const socket = io();

export default {
  name: 'app',
  data() {
    return {
      typingText: '',
      messages: []
    };
  },
  methods: {
    chatSubmit: function() {
      socket.emit('chat message', this.typingText);
      this.typingText = '';
    },
    incomingMessage: function(msg) {
      this.messages.push(msg);
    },
  },
  mounted() {
    socket.on('chat message', (msg) => {
      this.incomingMessage(msg);
    });
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font: 16px Helvetica, Arial;
  }

  header {
    padding: 20px;
  }

  form {
    background: #000;
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
    background: #eee;
  }
</style>
