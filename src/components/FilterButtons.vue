<template>
  <div>
    <b-button-group class="mr-4" size="sm">
      <b-button
        v-for="currency in currencies"
        :key="currency"
        variant="outline-primary"
        :class="{active: currency === selectedCurrency}"
        @click="selectCurrency(currency)"
      >{{ currency }}</b-button>
    </b-button-group>

    <b-button-group class="mr-4" size="sm">
      <b-button
        v-for="year in yrs"
        :key="year"
        variant="outline-primary"
        :class="{active: selectedYears.indexOf(year) !== -1}"
        @click="toggleYear(year)"
      >{{ year }}</b-button>
    </b-button-group>

    <b-button-group class="mr-4" size="sm">
      <b-button
        v-for="param in parameters"
        :key="param"
        variant="outline-primary"
        :class="{active: param === displayParameter}"
        @click="selectParameter(param)"
      >{{ param }}</b-button>
    </b-button-group>
  </div>
</template>

<script>
export default {
  name: "FilterButtons",
  async created() {

  },
  computed: {
    currencies() {
      return this.$store.getters.currencies
    },
    yrs() {
      return this.$store.getters.yrs
    },
    parameters() {
      return this.$store.getters.parameters
    },
    selectedCurrency() {
      return this.$store.getters.selectedCurrency
    },
    selectedYears() {
      return this.$store.getters.selectedYears
    },
    displayParameter() {
      return this.$store.getters.displayParameter
    }
  },
  watch: {
    selectedCurrency(newValue, oldValue) {
      if(oldValue !== '') {
        this.$store.dispatch('selectAllYears');
      }
    }
  },
  methods: {
    selectCurrency(currency) {
      this.$store.dispatch('selectCurrency', currency);
    },
    toggleYear(year) {
      this.$store.dispatch('toggleSelectedYear', year);
    },
    selectParameter(param) {
      this.$store.dispatch('selectDisplayParameter', param);
    }
  }
}
</script>

<style scoped>

</style>
