export default {
  mounted() {
    console.log('Checking for user session'); // eslint-disable-line no-console
    // 1. Check for user session
    // 2. If no user - bring to the home page
    const username = this.getUsername();
    if (!username) {
      this.$router.push({ path: `/` });
    }
  },
  methods: {
    getUsername() {
      return localStorage.getItem('username');
    },
    setUsername(name) {
      localStorage.setItem('username', name);
    },
    getPastRooms() {
      const pastRooms = localStorage.getItem('pastRooms');
      return JSON.parse(pastRooms);
    },
    setPastRoom(room) {
      let pastRooms = this.getPastRooms();
      const currentRoom = `${room.roomData['room-name']}&&&${room.roomId}`;
      if (pastRooms && pastRooms.length > 0) {
        if (!pastRooms.includes(currentRoom)) {
          pastRooms.push(currentRoom);
          pastRooms = JSON.stringify(pastRooms);
          localStorage.setItem('pastRooms', pastRooms);
        }
      } else {
        pastRooms = [currentRoom];
        pastRooms = JSON.stringify(pastRooms);
        localStorage.setItem('pastRooms', pastRooms);
      }
    }
  },
};
