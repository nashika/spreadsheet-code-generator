<template lang="pug">
  #container.container-fluid
    #row.row
      #menu-area.col-xs-3(v-if="$hub.showMenu")
        menu-component(:mode.sync="$hub.mode")
        sheets-component(v-if="$hub.sheets")
        search-component()
        column-component(v-if="$hub.mode == 'data' && $hub.currentSheet.name != 'root'")
      #main-area(:class="{'col-xs-9': $hub.showMenu, 'col-xs-12': !$hub.showMenu}")
        #main-message(v-if="$hub.currentSheet.name == 'root' && $hub.mode == 'data'") root sheet can not have data, please select or create new sheet.
        spreadsheet-component(v-if="$hub.mode == 'data'")
        code-editor-component(v-if="$hub.mode == 'code'")
</template>

<script lang="ts" src="./app.component.ts"></script>
