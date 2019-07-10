<template>
  <div class="card-list">
    <div class="playing-card" v-for="vote in votes" :key="vote.playerName">
      <div class="card-wrap">
        <transition-group name="fade">
          <img :src="getCard(vote)" :key="vote.value">
          <span :key="`val-${vote.value}`" v-if="vote.value !== '-' && showVotes"
            class="vote-value"
          >
            {{vote.value}}
          </span>
        </transition-group>
      </div>
      <p>{{vote.playerName}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardList',
  props: {
    showVotes: Boolean,
    votes: Array,
  },
  data() {
    return {
      img: {
        cardBack: require('../assets/card.png'),
        blankCard: require('../assets/blankCard.png'),
        greyscaleCardBack: require('../assets/greyscaleCardBack.png'),
      },
    };
  },
  methods: {
    getCard(vote) {
      let imgSrc = this.img.greyscaleCardBack;
      if (vote.value !== '-' && !this.showVotes) {
        imgSrc = this.img.cardBack;
      } else if (vote.value !== '-' && this.showVotes) {
        imgSrc = this.img.blankCard;
      }

      return imgSrc;
    },
  },
}
</script>

<style lang="scss" scoped>
.card-list {
  display: flex;

  .playing-card {
    margin-right: 1rem;

    img {
      height: 150px;
    }
  }

  .card-wrap {
    display: flex;
    position: relative;
  }

  .vote-value {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $ui-color-action;
  }
}

.fade-enter-active {
  transition: all 1.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(50px);
}
</style>
