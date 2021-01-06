<template>
  <b-row>
    <b-col
      v-for="header in headers"
      :key="header.text"
      :cols="calculateLength(header)"
      :class="{'px-0': header.base, 'px-1': !header.base}"
    >
      <template v-if="Object.prototype.hasOwnProperty.call(header, 'subItems')">
        <b-row>
          <b-col cols="12">
            <div
              class="header__text header__text_subitem py-1"
              :class="header.align"
            >{{ header.text }}</div>
          </b-col>
        </b-row>
        <b-row>
          <b-col
            v-for="subHeader in header.subItems"
            :key="subHeader.text"
            class="px-0"
            :cols="calculateSubItemLength(subHeader, calculateLength(header))"
          >
            <div
              class="header__text header__text_base py-1"
              :class="subHeader.align"
            >
              {{ subHeader.text }}
            </div>
          </b-col>
        </b-row>
      </template>
      <div
        v-else
        :class="header.align"
        class="header__text header__text_base py-1"
      >
        {{ header.text }}
        <div style="justify-content: center" class="px-2">
          <a
            :class="{active: header.value === sortBy}"
            href="#"
            @click.prevent="resort(header)"
          >
            <b-icon
              v-if="header.sortable"
              :icon="getSortIcon(header)"
              aria-hidden="true"
            ></b-icon>
          </a>
        </div>
      </div>

    </b-col>
  </b-row>
</template>

<script>
import { calculateLength, calculateSubItemLength } from "@/utils";

export default {
  name: "Header",
  props: {
    headers: {
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
      validator: value => ['desc', 'asc'].indexOf(value) !== -1,
    },
    remainingLength: {
      type: Number,
      required: true,
    },
    countWithoutLength: {
      type: Number,
      required: true,
    }
  },
  data: () =>({

  }),
  computed: {

  },
  methods: {
    calculateLength(header) {
      return calculateLength(header, this.remainingLength, this.countWithoutLength);
    },
    calculateSubItemLength(subItem, all) {
      return calculateSubItemLength(subItem, all,  this.remainingLength, this.countWithoutLength);
    },
    getSortIcon(header) {
      let icon =  'caret-up-fill';
      if(this.sortBy === header.value) {
        icon = this.sortDirection === 'asc' ? 'caret-up-fill' : 'caret-down-fill';
      }
      return icon;
    },

    // event handlers
    resort(header) {
      this.$emit('resort', header);
    }
  }
}
</script>

<style scoped lang="scss">

.header__text {
  display: flex;
  height: 100%;
  align-items: flex-end;
  font-size: 14px;
  border-bottom: 1px solid #2c3e50;

  a {
    color: #b3b3b3;
  }
  a.active {
    color: #2c3e50;
  }
}
.header__text_base {
  color: var(--gray);
}
.header__text_subitem {
  font-size: 14px;
  font-weight: 600;
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
