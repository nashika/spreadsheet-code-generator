<template lang="pug">
section.app(v-if="initialized")
  #main.d-flex
    #menu-area(v-if="$myStore.hub.showMenu")
      menu-component
      sheets-component
      search-component
      // column-component(v-if="$myStore.hub.mode == 'data' && $myStore.hub.currentSheet && $myStore.hub.currentSheet.name != 'root'")
    #main-area(:class="{'col-xs-9': $myStore.hub.showMenu, 'col-xs-12': !$myStore.hub.showMenu}")
      nuxt
section.initialize(v-else)
  fa.fa-pulse(icon="['fas', 'spinner']") 起動中
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";
import { config } from "vuex-module-decorators";

import { BaseComponent } from "~/src/components/base.component";
import MenuComponent from "~/src/components/menu.component.vue";
import SheetsComponent from "~/src/components/sheets.component.vue";
import SearchComponent from "~/src/components/search.component.vue";
import { BaseService } from "~/src/service/base.service";
import { setBaseStoreRootComponent } from "~/src/store/base";

config.rawError = true;

@Component({
  components: {
    MenuComponent,
    SheetsComponent,
    SearchComponent,
  },
})
export default class DefaultLayoutComponent extends BaseComponent {
  initialized: boolean = true;

  async beforeCreate() {
    BaseService.prototype.$root = this.$root;
    setBaseStoreRootComponent(this.$root);
    this.$myService.menu.initialize();
    // this.$myStore.config.a_load();
    // this.$myStore.sheet.a_loadAll();
    this.initialized = true;
    await Promise.resolve();
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
