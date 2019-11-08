export default {
  methods: {
    getUsername() {
      return localStorage.getItem('username');
    },
    setUsername(name) {
      localStorage.setItem('username', name);
    },
    getPastRooms() {
      const pastRooms = localStorage.getItem('pastRooms') || '[]';
      return JSON.parse(pastRooms);
    },
    setPastRoom(roomId, roomName) {
      if (!roomId || !roomName) {
        return;
      }

      let pastRooms = this.getPastRooms();
      const currentRoom = `${roomName}&&&${roomId}`;
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
    },
  },
};
