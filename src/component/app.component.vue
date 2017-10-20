<template lang="pug">
  .app-component
    #container.container-fluid
      #row.row
        #menu-area.col-xs-3(v-if="$hub.showMenu")
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
    height: 100%;
    padding: 5px;
    overflow-y: auto;
  }

  #main-area {
    padding: 0px;
    height: 100%;
  }
</style>

<script lang="ts" src="./app.component.ts"></script>
