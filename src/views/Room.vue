<template>
  <main>
    <h1>Room view</h1>
    <h2>Room: {{ roomId }}</h2>
  </main>
</template>

<script>
export default {
  name: 'Room',
  computed: {
    roomId() {
      return this.$route.params.roomId;
    }
  }
}
</script>