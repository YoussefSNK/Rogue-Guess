<template>
    <div class="image-card">
      <h3>{{ title }}</h3>
      <img :src="imageSrc" :alt="title" class="request-image" @click="handleClick">
    </div>
</template>

<script>
export default {
  name: 'ImageCard',
  props: {
    title: String,
    imageSrc: String
  },
  methods: {
    handleClick() {
    // Émettre un événement au parent si nécessaire
      this.$emit('image-clicked', this.title);
    }
  }
};
</script>

<style scoped>
.request-image {
cursor: pointer;
max-width: 100%;
/* Autres styles ici */
}
</style>
