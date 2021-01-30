<template lang="pug">
  .menu-component
    b-card(no-body)
      .h6(slot="header") #[i.fa.fa-cube] Menu
      b-list-group(flush)
        b-list-group-item
          b-form-radio-group.w-100(buttons, button-variant="outline-primary", v-model="$myStore.hub.mode",
            :options="[{text: 'Data', value: 'data'}, {text: 'Code', value: 'code'}]")
        b-list-group-item
          b-button(variant="primary", block, @click="generate") #[i.fa.fa-industry] Generate
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";

import { BaseComponent } from "./base.component";

@Component({})
export default class MenuComponent extends BaseComponent {
  generate() {
    // this.generatorService.generate();
  }
}
</script>
