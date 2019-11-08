<template>
  <div class="story-clock">
    Time: {{ timer }}
    <i
      v-if="isTimerGoing"
      class="fas fa-stop"
      @click="timerEvent('stop')"
    />
    <i
      v-else
      class="fas fa-play"
      @click="timerEvent('start')"
    />
    <i
      class="fas fa-trash-alt"
      @click="timerEvent('clear')"
    />
  </div>
</template>

<script>
import io from 'socket.io-client';

const socket = io();

export default {
  name: 'Timer',
  props: {
    roomId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isTimerGoing: false,
      seconds: 0,
      timer: '0:0:0',
      timerInterval: () => {},
    };
  },
  mounted() {
    socket.on(`room:${this.roomId}:timerEvent`, eventName => {
      if (eventName === 'start') {
        this.startTimer();
      } else if (eventName === 'stop') {
        this.stopTimer();
      } else if (eventName === 'clear') {
        this.clearTimer();
      }
    });
  },
  methods: {
    clearTimer() {
      // TODO: put this on a socket
      this.timer = '0:0:0';
      this.seconds = 0;
      this.isTimerGoing = false;
      clearInterval(this.timerInterval);
    },
    startTimer() {
      // TODO: put this on a socket
      this.isTimerGoing = true;
      this.timerInterval = setInterval(() => {
        this.seconds++;

        const hours = Math.floor(this.seconds / 3600);
        const minutes = Math.floor((this.seconds - (hours * 3600)) / 60);
        const displaySeconds = this.seconds - (hours * 3600) - (minutes * 60);
        this.timer = `${hours}:${minutes}:${displaySeconds}`;
      }, 1000);
    },
    stopTimer() {
      // TODO: put this on a socket
      this.isTimerGoing = false;
      clearInterval(this.timerInterval);
    },
    timerEvent(eventName) {
      socket.emit('timerEvent', { roomId: this.roomId, eventName });
    },
  },
};
</script>

<style lang="scss" scoped>
  .story-clock {
    padding: $pad-unit;
  }

  i {
    margin-left: 1rem;
    cursor: pointer;
  }
</style>
