<template lang="pug">
  .app-component
    #main.d-flex
      #menu-area(v-if="$hub.showMenu")
        menu-component()
        sheets-component(v-if="$hub.sheets")
        search-component()
        column-component(v-if="$hub.mode == 'data' && $hub.currentSheet && $hub.currentSheet.name != 'root'")
      #main-area(:class="{'col-xs-9': $hub.showMenu, 'col-xs-12': !$hub.showMenu}")
        #main-message(v-if="$hub.mode == 'data' && $hub.currentSheet && $hub.currentSheet.name == 'root'") root sheet can not have data, please select or create new sheet.
        spreadsheet-component(v-if="$hub.mode == 'data'")
        code-editor-component(v-if="$hub.mode == 'code'")
</template>

<style lang="scss">
  #container, #row {
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
    padding: 0px;
  }
</style>

<script lang="ts" src="./app.component.ts"></script>
