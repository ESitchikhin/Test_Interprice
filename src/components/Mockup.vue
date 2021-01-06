<template>
  <b-container>
    <b-row class="text-left mb-3">
      <b-col>
        <FilterButtons/>
      </b-col>
    </b-row>
    <b-row class="text-left mb-3">
      <b-col cols="4">
        <FilterInput />
      </b-col>
    </b-row>
    <DataTable
      :headers="tableHeaders"
      :footer="tableFooter"
      :items="tableItems"
      :parameters="parameters"
      :display-parameter="displayParameter"
      :filter="filterByCompany"
      :default-sort-by="'dateSet'"
      :format-date="'%d-%b-%y'"
    />
  </b-container>
</template>

<script>
import FilterButtons from "@/components/FilterButtons";
import FilterInput from "@/components/FilterInput";
import DataTable from "@/components/DataTable";
export default {
  name: "Mockup",
  components: {DataTable, FilterInput, FilterButtons},
  async created() {
    await this.$store.dispatch('fetchData');
    await this.$store.dispatch('selectCurrency', this.currencies[0]);
    await this.$store.dispatch('selectAllYears');
    await this.$store.dispatch('selectDisplayParameter', this.parameters[0]);
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
    },
    filterByCompany() {
      return this.$store.getters.filterByCompanyStr
    },
    couponTypes() {
      return this.$store.getters.couponTypes
    },
    tableItems() {
      return this.$store.getters.resultData
    },
    tableHeaders() {
      return this.$store.getters.headersData
    },
    tableFooter() {
      return this.$store.getters.averageData
    }
  },

}
</script>

<style scoped lang="scss">

</style>
