<template lang="pug">
  .sheets-component
    b-card(no-body)
      template(slot="header")
        b-dropdown.float-right.my-0(variant="primary", size="sm")
          template(slot="button-content") #[i.fa.fa-bars]
          b-dropdown-item(v-b-modal.add-modal) #[i.fa.fa-fw.fa-plus] Add
          b-dropdown-item(v-if="$hub.currentSheet.name != 'root'", v-b-modal.edit-modal) #[i.fa.fa-fw.fa-pencil] Edit
          b-dropdown-item(v-if="$hub.currentSheet.name != 'root'", @click="remove") #[i.fa.fa-fw.fa-trash] Delete
        h6 #[i.fa.fa-table] Sheets
      b-list-group(flush)
        template(v-for="treeSheet in treeSheets")
          b-list-group-item(@click="select(treeSheet.sheet)",
          :class="{'list-group-item-info': treeSheet.sheet == $hub.currentSheet}",
          :style="{'padding-left': treeSheet.level * 10 + 10 + 'px'}") {{treeSheet.sheet.name}}
            span.label.label-danger.pull-right(v-if="$hub.sheetMetas[treeSheet.sheet.name] && $hub.sheetMetas[treeSheet.sheet.name].modified") !
    b-modal#add-modal(title="Add Sheet", @ok="add()")
      b-form
        b-form-group(label="Parent Sheet")
          b-form-input(type="text", v-model="$hub.currentSheet.name", :readonly="true")
        b-form-group(label="New Sheet Name")
          b-form-input(type="text", v-model="newSheetName", required)
    b-modal#edit-modal(title="Edit Sheet", @ok="edit()")
      b-form
        b-form-group(label="Parent Sheet")
          b-form-select(v-model="newSheetParent", required)
            //option(value="", selected)
            option(v-for="treeSheet in notSelfOrChildTreeSheets(treeSheets)",
            :value="treeSheet.sheet.name", :selected="treeSheet.sheet.name == $hub.currentSheet.parent") {{treeSheet.sheet.name}}
        b-form-group(label="Sheet Name")
          b-form-input(type="text", v-model="newSheetName", required)
</template>

<script lang="ts" src="./sheets.component.ts"></script>
