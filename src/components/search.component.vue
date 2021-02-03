<template lang="pug">
section.search
  b-card(no-body)
    .h6(slot="header")
      fa(icon="search")
      | &nbsp;Search
    b-list-group(flush)
      b-list-group-item
        b-form(@submit.prevent="search")
          b-input-group
            b-form-input(type="text", v-model="query", placeholder="Search for...")
            b-input-group-append
              b-btn(type="submit", variant="primary")
                fa(icon="search")
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";

import { BaseComponent } from "./base.component";
import { eventNames } from "~/src/util/event-names";

@Component
export default class SearchComponent extends BaseComponent {
  query: string = "";

  search() {
    if (!this.query) return;
    this.$root.$emit(eventNames.search, this.query);
  }
}
</script>
