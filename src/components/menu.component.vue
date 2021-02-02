<template lang="pug">
.menu-component
  b-card(no-body)
    .h6(slot="header")
      fa(icon="cube")
      | &nbsp;Menu
    b-list-group(flush)
      b-list-group-item
        b-button-group.w-100
          b-button(to="/data", variant="outline-primary", :pressed="$route.path === '/data'") Data
          b-button(to="/code", variant="outline-primary", :pressed="$route.path === '/code'") Code
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
    // this.generatorService.generate();
  }
}
</script>
