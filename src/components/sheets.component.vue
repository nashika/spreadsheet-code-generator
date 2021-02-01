<template lang="pug">
  .sheets-component
    b-card(no-body)
      template(slot="header")
        b-dropdown.pull-right.my-0(variant="primary", size="sm")
          template(slot="button-content") #[i.fa.fa-bars]
          b-dropdown-item(v-b-modal.add-modal) #[i.fa.fa-fw.fa-plus] Add
          b-dropdown-item(v-if="$myStore.sheet.currentSheet.name != 'root'", v-b-modal.edit-modal) #[fa(icon="pencil")] Edit
          b-dropdown-item(v-if="$myStore.sheet.currentSheet.name != 'root'", @click="remove") #[fa(icon="trash")] Delete
        h6 #[i.fa.fa-table] Sheets
      b-list-group(flush)
        template(v-for="treeSheet in treeSheets")
          b-list-group-item(@click="select(treeSheet.sheet)", :active="treeSheet.sheet == $myStore.sheet.currentSheet",
            :style="{'padding-left': treeSheet.level * 10 + 10 + 'px'}") {{treeSheet.sheet.name}}
            b-badge.pull-right(v-if="$myStore.sheet.sheets[treeSheet.sheet.name].meta && $myStore.sheet.sheets[treeSheet.sheet.name].meta.modified", variant="danger") !
    b-modal#add-modal(title="Add Sheet", @show="showAddModal", @ok="okAddModal")
      b-form
        b-form-group(label="Parent Sheet")
          b-form-input(type="text", v-model="newSheetParent", :readonly="true")
        b-form-group(label="New Sheet Name")
          b-form-input(type="text", v-model="newSheetName", required)
    b-modal#edit-modal(title="Edit Sheet", @show="showEditModal", @ok="okEditModal")
      b-form
        b-form-group(label="Parent Sheet")
          b-form-select(v-model="newSheetParent", required)
            option(v-for="treeSheet in notSelfOrChildTreeSheets(treeSheets)", :value="treeSheet.sheet.name") {{treeSheet.sheet.name}}
        b-form-group(label="Sheet Name")
          b-form-input(type="text", v-model="newSheetName", required)
</template>

<script lang="ts">
import _ from "lodash";
import { Component } from "nuxt-property-decorator";

import { ISheet } from "~/src/store/sheet";
import { BaseComponent } from "~/src/components/base.component";

interface ITreeSheet {
  sheet: ISheet;
  level: number;
}

@Component({
  watch: {
    "$hub.sheets": {
      handler: SheetsComponent.prototype.watchSheets,
      deep: true,
    },
  },
})
export default class SheetsComponent extends BaseComponent {
  treeSheets: ITreeSheet[] = [];
  newSheetParent: string = "";
  newSheetName: string = "";

  // eslint-disable-next-line require-await
  async mounted(): Promise<void> {
    this.watchSheets();
  }

  select(sheet: ISheet): void {
    this.$myStore.sheet.select(sheet);
  }

  showAddModal(): void {
    this.newSheetParent = this.$myStore.sheet.currentSheet?.name ?? "";
    this.newSheetName = "";
  }

  okAddModal(e: Event): void {
    if (
      !this.$myStore.sheet.add(
        this.newSheetName,
        this.$myStore.sheet.currentSheet?.name ?? ""
      )
    ) {
      e.preventDefault();
    }
  }

  showEditModal(): void {
    this.newSheetParent = this.$myStore.sheet.currentSheet?.parent ?? "";
    this.newSheetName = this.$myStore.sheet.currentSheet?.name ?? "";
  }

  okEditModal(e: Event): void {
    if (
      !this.$myStore.sheet.edit(
        this.$myStore.sheet.currentSheet?.name ?? "",
        this.newSheetName,
        this.newSheetParent
      )
    ) {
      e.preventDefault();
    }
  }

  remove(): void {
    this.$myStore.sheet.remove();
  }

  notSelfOrChildTreeSheets(treeSheets: ITreeSheet[]): ITreeSheet[] {
    return _.filter(treeSheets, (treeSheet) => {
      const sheetName = treeSheet.sheet.name;
      if (sheetName === this.$myStore.sheet.currentSheet?.name) return false;
      if (!this.$myStore.sheet.sheets[sheetName]) return true;
      return !this.$myStore.sheet.isParentRecursive(
        this.$myStore.sheet.sheets[sheetName],
        this.$myStore.sheet.currentSheet
      );
    });
  }

  watchSheets(): void {
    this.treeSheets = this.treeSheetRecursive("", 0);
  }

  treeSheetRecursive(parentSheetName: string, level: number): ITreeSheet[] {
    const result: ITreeSheet[] = _(this.$myStore.sheet.sheets)
      .filter((sheet) => sheet.parent === parentSheetName)
      .map((sheet) => ({ sheet, level }))
      .sortBy("sheet.name")
      .value();
    return _.flatMap(result, (treeSheet: ITreeSheet) => {
      return _.concat(
        [treeSheet],
        this.treeSheetRecursive(treeSheet.sheet.name, level + 1)
      );
    });
  }
}
</script>
