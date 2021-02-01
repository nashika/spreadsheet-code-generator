<template lang="pug">
section.app(v-if="initialized")
  #main.d-flex
    #menu-area(v-if="$myStore.hub.showMenu")
      menu-component
      // sheets-component(v-if="$myStore.hub.sheets")
      // search-component()
      // column-component(v-if="$myStore.hub.mode == 'data' && $myStore.hub.currentSheet && $myStore.hub.currentSheet.name != 'root'")
    #main-area(:class="{'col-xs-9': $myStore.hub.showMenu, 'col-xs-12': !$myStore.hub.showMenu}")
      #main-message(v-if="$myStore.hub.mode == 'data' && $myStore.sheet.currentSheet && $myStore.sheet.currentSheet.name == 'root'") root sheet can not have data, please select or create new sheet.
      nuxt
section.initialize(v-else) 起動中
  fa.fa-pulse(:icon="['fas', 'spinner']") 起動中
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";
import { config } from "vuex-module-decorators";

import { BaseComponent } from "~/src/components/base.component";
import MenuComponent from "~/src/components/menu.component.vue";

config.rawError = true;

@Component({
  components: {
    MenuComponent,
  },
})
export default class DefaultLayoutComponent extends BaseComponent {
  initialized: boolean = true;

  // eslint-disable-next-line require-await
  async beforeCreate() {
    this.$myStore.config.load();
    this.$myStore.sheet.loadAll();
    this.initialized = true;
  }
}
</script>

<style lang="scss">
html {
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

#container,
#row {
  height: 100%;
}

#menu-area {
  flex: 0 0 250px;
  height: 100vh;
  padding: 2px;
  overflow-y: scroll;

  > div {
    margin-bottom: 4px;
  }
}

#main-area {
  flex: 1 0 0;
  height: 100vh;
  padding: 0;
}
</style>
