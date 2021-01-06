<template>
    <b-form-input v-model="filterValue" placeholder="Filter by company name ..."></b-form-input>
</template>

<script>
export default {
  name: "FilterInput",
  data: () => ({
    filterValue: '',
  }),
  watch: {
    filterValue(newValue) {
      this.$store.dispatch('setFilterByCompany', newValue);
    }
  }
}
</script>

<style scoped>

</style>
