<template lang="pug">
  .sheets-component
    b-card(no-body)
      h6(slot="header") #[i.fa.fa-table] Sheets
        b-dropdown(variant="primary", size="xs")
          template(slot="button-content") #[i.fa.fa-bars]
          b-dropdown-item(@click="addModal = true") #[i.fa.fa-fw.fa-plus] Add
          b-dropdown-item(v-if="$hub.currentSheet.name != 'root'", @click="editModal = true") #[i.fa.fa-fw.fa-pencil] Edit
          b-dropdown-item(v-if="$hub.currentSheet.name != 'root'", @click="remove") #[i.fa.fa-fw.fa-trash] Delete
      ul.list-group
        li.list-group-item(v-for="treeSheet in treeSheets", @click="select(treeSheet.sheet)",
        :class="{'list-group-item-info': treeSheet.sheet == $hub.currentSheet}",
        :style="{'padding-left': treeSheet.level * 10 + 10 + 'px'}") {{treeSheet.sheet.name}}
          span.label.label-danger.pull-right(v-if="$hub.sheetMetas[treeSheet.sheet.name] && $hub.sheetMetas[treeSheet.sheet.name].modified") !

    form(@submit.prevent="add")
      modal(:show.sync="addModal")
        .modal-header(slot="modal-header")
          h4.modal-title Add Sheet
        .modal-body(slot="modal-body")
          .form-group
            label Parent Sheet
            input.form-control(type="text", v-model="$hub.currentSheet.name", :readonly="true")
            label New Sheet Name
            input.form-control(type="text", v-model="newSheetName", required)
        .modal-footer(slot="modal-footer")
          .row
            .col-xs-6
              button.btn.btn-block.btn-default(type="button", @click="addModal = false") Cancel
            .col-xs-6
              button.btn.btn-block.btn-primary(type="submit") Add

    form(@submit.prevent="edit")
      modal(:show.sync="editModal")
        .modal-header(slot="modal-header")
          h4.modal-title Edit Sheet
        .modal-body(slot="modal-body")
          .form-group
            label Parent Sheet
            select.form-control(v-model="newSheetParent", required)
              //option(value="", selected)
              option(v-for="treeSheet in notSelfOrChildTreeSheets(treeSheets)",
              :value="treeSheet.sheet.name", :selected="treeSheet.sheet.name == $hub.currentSheet.parent") {{treeSheet.sheet.name}}
            label Sheet Name
            input.form-control(type="text", v-model="newSheetName", required)
        .modal-footer(slot="modal-footer")
          .row
            .col-xs-6
              button.btn.btn-block.btn-default(type="button", @click="editModal = false") Cancel
            .col-xs-6
              button.btn.btn-block.btn-primary(type="submit") Edit
</template>

<script lang="ts" src="./sheets.component.ts"></script>

