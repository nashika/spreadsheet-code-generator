<template lang="pug">
  .search-component
    b-card(no-body)
      .h6(slot="header") #[i.fa.fa-search] Search
      b-list-group(flush)
        b-list-group-item
          b-form(@submit.prevent="search")
            b-input-group
              b-form-input(type="text", v-model="query", placeholder="Search for...")
              b-input-group-append
                b-btn(type="submit", variant="primary") #[i.fa.fa-search]
</template>

<script lang="ts" src="./search.component.ts"></script>
