<template>
  <b-container>
    <Header
      :headers="headers"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      :remaining-length="remainingLength"
      :count-without-length="countWithoutLength"
      @resort="resortData"
    />
    <Items
      :headers="headers"
      :items="items"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      :filter="filter"
      :parameters="parameters"
      :display-parameter="displayParameter"
      :remaining-length="remainingLength"
      :count-without-length="countWithoutLength"
      :format-date="formatDate"
    />
    <Average
      :headers="headers"
      :footer="footer"
      :remaining-length="remainingLength"
      :count-without-length="countWithoutLength"
    />
  </b-container>
</template>

<script>
import Header from "@/components/Header";
import Items from "@/components/Items";
import Average from "@/components/Average";
export default {
  name: "DataTable",
  components: {Average, Items, Header},
  props: {
    headers: {
      type: Array,
      required: true,
      validator: value => value.length > 0,
    },
    footer: {
      type: Object,
    },
    items: {
      type: Array,
      required: true,
      validator: value => value.length > 0,
    },
    parameters: {
      type: Array,
      required: true,
    },
    displayParameter: {
      type: String,
      required: true,
    },
    defaultSortBy: {
      type: String,
      required: true,
    },
    filter: {
      type: String
    },
    formatDate: {
      type: String
    }
  },
  data: () => ({
    sortBy: '',
    sortDirection: 'desc',
  }),
  mounted() {
    this.sortBy = this.defaultSortBy;
  },
  computed: {
    remainingLength() {
      let summ = this.headers.reduce((summ, header) => {
        if(Object.prototype.hasOwnProperty.call(header, 'subItems')) {

          return header.subItems.reduce((summ, subItem) => {
            if(Object.prototype.hasOwnProperty.call(subItem, 'length')) {
              return summ + subItem.length;
            }
            return summ;
          }, summ);

        } else {

          if(Object.prototype.hasOwnProperty.call(header, 'length')) {
            return summ + header.length;
          }

          return summ;
        }
      }, 0);
      return (12 - summ) > 0 ? (12 - summ) : 0;
    },
    countWithoutLength() {
      let qount = this.headers.reduce((qount, header) => {
        if(Object.prototype.hasOwnProperty.call(header, 'subItems')) {

          return header.subItems.reduce((qount, subItem) => {
            if(!Object.prototype.hasOwnProperty.call(subItem, 'length')) {
              return qount + 1;
            }
            return qount;
          }, qount);

        } else {

          if(!Object.prototype.hasOwnProperty.call(header, 'length')) {
            return qount + 1;
          }

          return qount;
        }
      }, 0);
      return qount ? qount : 1;
    },
    numberD() {
      return parseFloat(this.items[1]["10 YRS"]["FIX"])
    }
  },
  methods: {
    resortData(header) {
      if(header.value === this.sortBy) {
        this.sortDirection =  this.sortDirection === 'desc' ? 'asc' : 'desc';
      } else {
        this.sortBy = header.value;
        this.sortDirection =  'desc';
      }
    }
  }
}
</script>

<style scoped>

</style>
