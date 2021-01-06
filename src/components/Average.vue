<template>
  <b-row style="border: 1px solid #2c3e50">
    <b-col
      v-for="header in headers"
      :key="header.text"
      :cols="calculateLength(header)"
      :class="{'px-0': header.base, 'px-1': !header.base}"
    >
      <template v-if="Object.prototype.hasOwnProperty.call(header, 'subItems')">
        <b-row style="height: 100%;">
          <b-col cols="12">
            <b-row style="height: 100%;">
              <b-col
                v-for="(subHeader) in header.subItems"
                :key="subHeader.text"
                class="px-0"
                :cols="calculateSubItemLength(subHeader, calculateLength(header))"
              >
                <div
                  class="average_text py-3"
                  :class="{[subHeader.align]: true}"
                >
                  {{ getSubItemValue(footer, subHeader.value) }}
                </div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </template>
      <div
        v-else-if="header.param"
        :class="header.align"
        class="average__text py-3"
      >
        {{ footer[header.value] }}
      </div>

    </b-col>
  </b-row>
</template>

<script>
import { calculateLength, calculateSubItemLength, getSubItemValue } from "@/utils";

export default {
  name: "Average",
  props: {
    headers: {
      type: Array,
      required: true,
      validator: value => value.length > 0,
    },
    footer: {
      type: Object,
      required: true,
    },
    remainingLength: Number,
    countWithoutLength: Number,
  },
  methods: {
    calculateLength(header) {
      return calculateLength(header, this.remainingLength, this.countWithoutLength);
    },
    calculateSubItemLength(subItem, all) {
      return  calculateSubItemLength(subItem, all,  this.remainingLength, this.countWithoutLength);
    },
    getSubItemValue(minValues, subHeaderValue) {
      return getSubItemValue(minValues, subHeaderValue);
    },
  }
}
</script>

<style scoped lang="scss">
.average__text {
  display: flex;
  height: 100%;
  align-items: flex-end;
  font-size: 14px;
  font-weight: 600;

a {
  color: #2c3e50;
}
}

.start {
  justify-content: flex-start;
}
.center {
  justify-content: center;
}

.end {
  justify-content: flex-end;
}
</style>
