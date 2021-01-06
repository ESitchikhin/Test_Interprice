<template>
  <div>
    <template v-for="(item, itemIndex) in displayItems">
      <b-row :key="itemIndex">
        <b-col
          v-for="(header, headerIndex) in headers"
          :key="header.text"
          :cols="calculateLength(header)"
          :class="{'px-0': header.base, 'px-1': !header.base}"
          class="px-0"
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
                        class="item__text item__text_base"
                        :class="{[subHeader.align]: true,
                        'display': item.isDisplay,
                        'inactive': !item.isActive}"
                      ><div class="py-1"
                        :class="{'min': subHeader.highlight
                        && getSubItemValue(item, subHeader.value)
                        && getSubItemMinValue(minBySubItems, subHeader.value) === getSubItemValue(item, subHeader.value)}"
                      >{{ getSubItemValue(item, subHeader.value) }} </div>
                      </div>
                    </b-col>
                  </b-row>
              </b-col>
            </b-row>

          </template>
          <div
            v-else
            :class="{[header.align]: true, 'display': item.isDisplay, 'inactive': !item.isActive}"
            class="item__text item__text_base py-1"
          >
            <div style="justify-content: center">
              <a
                class="px-2"
                v-if="headerIndex === 0 && item.isDisplay"
                href="#"
                @click.prevent="openParams(item)"
              >
                <b-icon
                  :icon="getGroupIcon(item)"
                  aria-hidden="true"
                ></b-icon>
              </a>
            </div>
            {{ item[header.value] }}
          </div>
        </b-col>
      </b-row>
    </template>
  </div>

</template>

<script>
import { calculateLength, calculateSubItemLength, getSubItemValue } from "@/utils";
import { timeFormat } from "d3";

export default {
  name: "Items",
  props: {
    headers: {
      type: Array,
      required: true,
      validator: value => value.length > 0,
    },
    items: {
      type: Array,
      required: true,
      validator: value => value.length > 0,
    },
    sortBy: {
      type: String,
      required: true,
    },
    sortDirection: {
      type: String,
      required: true,
      validator: value => ['desc', 'asc'].indexOf(value.toLowerCase()) !== -1,
    },
    filter: {
      type: String
    },
    parameters: {
      type: Array,
      required: true,
    },
    displayParameter: {
      type: String,
      required: true,
    },
    remainingLength: Number,
    countWithoutLength: Number,
    formatDate: String,
  },
  data: () => ({
    openedParams: [],
  }),
  watch: {
    item: {
      handler() {
        this.setupMinValue();
      },
      deep: true,
    }
  },
  computed: {
    sortItems() {
      let sortedItems = [];
      const sortedHeader = this.headers.find(header => header.value === this.sortBy);

      if(sortedHeader && ['desc', 'asc'].indexOf(this.sortDirection.toLowerCase()) !== -1) {

        this.items.forEach(item => {
          let isFiltered = true;
          if(this.filter && this.filter.length > 0) {

            this.headers.forEach(header => {
              if(header.filterable) {
                isFiltered = String.prototype.includes.call(item[header.value].toLowerCase(), this.filter.toLowerCase())
              }
            })
          }
          if(isFiltered) {

            let currentDelta = Math.floor(sortedItems.length / 2) || 1;
            let currentIndex = sortedItems.length - 1;
            let isNotFound = true;
            let toUp = false;


            for (; isNotFound && currentIndex >= 0 && currentIndex < sortedItems.length;) {

              if (item.isActive && sortedItems[currentIndex].isActive
                || !item.isActive && !sortedItems[currentIndex].isActive) {

                const itemValue = item[this.sortBy];
                const currentSortedValue = sortedItems[currentIndex][this.sortBy];
                const nextSortedValue = currentIndex + 1 < sortedItems.length
                  ? sortedItems[currentIndex + 1][this.sortBy]
                  : '';

                const compareString = sortedHeader.isDate
                  ? this.compareDate(new Date(itemValue), new Date(currentSortedValue))
                  : String.prototype.localeCompare.call(itemValue, currentSortedValue);

                const compareNextString = currentIndex + 1 < sortedItems.length
                  ? sortedHeader.isDate
                    ? this.compareDate(new Date(itemValue), new Date(nextSortedValue))
                    : String.prototype.localeCompare.call(itemValue, nextSortedValue)
                  : (this.sortDirection.toLowerCase() === 'desc'
                    ? 1 : -1);

                const currentToUp = this.sortDirection.toLowerCase() === 'desc'
                  ? compareString <= 0
                  : compareString > 0;
                const nextToUp = this.sortDirection.toLowerCase() === 'desc'
                  ? compareNextString <= 0
                  : compareNextString > 0;


                if (currentToUp && nextToUp) {
                  toUp = true;
                } else if (currentToUp && !nextToUp) {
                  isNotFound = false;
                  currentIndex++;
                } else {
                  if (currentIndex - 1 > 0 && (!item.isActive && sortedItems[currentIndex - 1].isActive)) {
                    isNotFound = false;
                  } else {
                    toUp = false;
                  }
                }

              } else {
                toUp = !(item.isActive && !sortedItems[currentIndex].isActive);
              }

              if (isNotFound) {
                currentDelta = Math.floor((toUp ? (sortedItems.length - currentIndex) / 2 : currentIndex / 2)) || 1;
                currentIndex = toUp ? currentIndex + currentDelta : currentIndex - currentDelta;
              }
            }

            sortedItems.splice(currentIndex > 0 ? currentIndex : 0, 0, item);
          }
        });
      }
      return sortedItems
    },
    displayItems() {
      let resultItems = [];
      let bufferItems = [];
      let resultRow = {};
      let isDisplay;
      let toBuffer;
      let currentDisplayValue
      let formatDate = timeFormat(this.formatDate);


      this.sortItems.forEach(item => {
        isDisplay = true;
        toBuffer = false;
        resultRow = {...item, isDisplay: false};

        this.headers.forEach(header => {
          // If column is base

          if(header.isDate) {
            resultRow[header.value] = item[header.value] ? formatDate(item[header.value]) : '';
          }

          if(header.base) {

            if(item.param !== this.displayParameter) {

              if(header.param && item.isActive) {
                isDisplay = (this.openedParams.indexOf(resultRow[header.value]) !== -1);
                toBuffer = (this.openedParams.indexOf(resultRow[header.value]) !== -1) && currentDisplayValue !== item[header.value]
              }

              resultRow[header.value] = header.param && item.isActive
                ? item.param
                : (item.isActive ? '' : resultRow[header.value]);

            }
            else {
              resultRow.isDisplay = true;
              if(header.param && item.isActive) {
                currentDisplayValue = item[header.value];
              }
            }
          }
        })

        if(toBuffer) {
          bufferItems.push(resultRow)
        } else if(isDisplay) {
          resultItems.push(resultRow);
          bufferItems.forEach(row => resultItems.push(row));
          bufferItems = [];
        }

      })

      return resultItems;
    },
    minBySubItems() {
      let minValues = {};

      this.items.forEach(item => {
        if(item.param === this.displayParameter) {
          this.headers.forEach(header => {
            if (Object.prototype.hasOwnProperty.call(header, 'subItems')) {
              header.subItems.forEach(subHeader => {

                let currentValue = this.getSubItemValue(item, subHeader.value);
                let minValue = this.getSubItemMinValue(minValues, subHeader.value) || Infinity;

                if (currentValue && parseFloat(currentValue) < parseFloat(minValue)) {
                  minValues = this.setSubItemMinValue(minValues, subHeader.value, currentValue);
                }
              })
            }
          });
        }
      });
      return minValues;
    }
  },
  methods: {
    compareDate(first, second) {
      if(first > second) {
        return 1
      } else if( second > first) {
        return -1
      } else {
        return 0;
      }
    },
    setupMinValue() {

    },
    calculateLength(header) {
      return calculateLength(header, this.remainingLength, this.countWithoutLength);
    },
    calculateSubItemLength(subItem, all) {
      return  calculateSubItemLength(subItem, all,  this.remainingLength, this.countWithoutLength);
    },
    getSubItemValue(item, subHeaderValue) {
      return getSubItemValue(item, subHeaderValue);
    },
    getSubItemMinValue(minValues, subHeaderValue) {
      return getSubItemValue(minValues, subHeaderValue);
    },
    setSubItemMinValue(minValues, subHeaderValue, min) {
      let result = {...minValues}
      let keys = subHeaderValue.split('.');
      if(!Object.prototype.hasOwnProperty.call(result, keys[0])) {
        result[keys[0]] = {}
      }
      result[keys[0]][keys[1]] = min;
      return result;
    },
    getGroupIcon(item) {
      return this.openedParams.indexOf(item[this.headers.find(prop => prop.param).value]) === -1
        ? 'chevron-right'
        : 'chevron-down'
    },
    openParams(item) {
      const value = item[this.headers.find(prop => prop.param).value];
      if(this.openedParams.indexOf(value) === -1) {
        this.openedParams.push(value);
      } else {
        this.openedParams.splice(this.openedParams.indexOf(value), 1);
      }
    }
  }
}
</script>

<style scoped lang="scss">

.item__text {
  display: flex;
  height: 100%;
  align-items: flex-end;
  font-size: 14px;
  border-bottom: 1px solid #e3e3e3;

  a {
    color: #2c3e50;
  }
}
.item__text_base {
  color: #2c3e50;
}
.header__text_subitem {
  font-size: 14px;
  font-weight: 600;
}

.item__text.display {
  font-weight: 700;
}

.item__text.inactive {
  color: #b3b3b3;
  font-weight: 700;
}

.min {
  background-color: #e2e2e2;
  margin: 0 10px;
  height: 100%;
  width: 100%;
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
