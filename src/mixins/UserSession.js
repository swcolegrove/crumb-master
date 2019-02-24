export default {
  mounted() {
    console.log('Checking for user session');
    // 1. Check for user session
    // 2. If no user - bring to the home page
    const username = this.getUsername();
    if (!username) {
      this.$router.push({ path: `/` });
    }
  },
  methods: {
    getUsername() {
      return sessionStorage.getItem('username');
    },
    setUsername(name) {
      sessionStorage.setItem('username', name);
    },
  },
};
