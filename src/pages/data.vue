<template lang="pug">
section.data
  #main-message(v-if="$myStore.hub.mode == 'data' && $myStore.sheet.currentSheet && $myStore.sheet.currentSheet.name == 'root'") root sheet can not have data, please select or create new sheet.
  .spreadsheet-component(style="height:100%")
    div#spreadsheet(style="height:100%")
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";

import { BaseComponent } from "~/src/components/base.component";

@Component
export default class DataComponent extends BaseComponent {
  private currentRow: number = 0;
  private currentCol: number = 0;
  private resizeTimer: any = null;
}
</script>
