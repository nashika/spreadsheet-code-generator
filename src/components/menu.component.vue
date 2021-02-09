<template lang="pug">
section.menu
  b-card(no-body)
    .h6(slot="header")
      fa(icon="cube")
      | &nbsp;Menu
    b-list-group(flush)
      b-list-group-item
        b-button(variant="primary", block, @click="generate")
          fa(icon="industry")
          | &nbsp;Generate
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";

import { BaseComponent } from "./base.component";

@Component
export default class MenuComponent extends BaseComponent {
  generate() {
    this.$myService.generator.generate();
  }
}
</script>
