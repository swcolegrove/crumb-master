import Home from './views/Home.vue'
import NotFound from './views/NotFound.vue'
import Room from './views/Room.vue'

export default {
  routes: [
    { path: '/', component: Home },
    { path: '/room/:roomId', component: Room },
    { path: '*', component: NotFound },
  ],
}