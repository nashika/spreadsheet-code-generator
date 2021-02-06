<template lang="pug">
section.sheets
  b-card(no-body)
    template(slot="header")
      b-dropdown.float-right.my-0(variant="primary", size="sm")
        template(slot="button-content")
          fa(icon="bars")
        b-dropdown-item(v-b-modal.add-modal)
          fa(icon="plus")
          | &nbsp;Add
        b-dropdown-item(v-if="$myStore.sheet.currentSheet.name !== 'root'", v-b-modal.edit-modal)
          fa(icon="edit")
          | &nbsp;Edit
        b-dropdown-item(v-if="$myStore.sheet.currentSheet.name !== 'root'", @click="remove")
          fa(icon="trash")
          | &nbsp;Delete
      h6
        fa(icon="table")
        | &nbsp;Sheets
    b-list-group(flush)
      template(v-for="treeSheet in treeSheets")
        b-list-group-item(@click="select(treeSheet.sheet)", :active="treeSheet.sheet === $myStore.sheet.currentSheet",
          :style="{'padding-left': treeSheet.level * 10 + 10 + 'px'}") {{treeSheet.sheet.name}}
          b-badge.float-right(v-if="$myStore.sheet.sheets[treeSheet.sheet.name].meta && $myStore.sheet.sheets[treeSheet.sheet.name].meta.modified", variant="danger") !
  b-modal#add-modal(title="Add Sheet", @show="showAddModal", hide-footer)
    b-form(@submit="submitAddModal", ref="addModal")
      b-form-group(label="Parent Sheet")
        b-form-input(type="text", v-model="newSheetParent", :readonly="true")
      b-form-group(label="New Sheet Name")
        b-form-input(type="text", v-model="newSheetName", required)
      b-button(type="submit", variant="primary") Submit
  b-modal#edit-modal(title="Edit Sheet", @show="showEditModal", hide-footer)
    b-form(@submit="submitEditModal", ref="editModal")
      b-form-group(label="Parent Sheet")
        b-form-select(v-model="newSheetParent", required)
          option(v-for="treeSheet in notSelfOrChildTreeSheets(treeSheets)", :value="treeSheet.sheet.name") {{treeSheet.sheet.name}}
      b-form-group(label="Sheet Name")
        b-form-input(type="text", v-model="newSheetName", required)
      b-button(type="submit", variant="primary") Submit
</template>

<script lang="ts">
import _ from "lodash";
import { Component } from "nuxt-property-decorator";

import { ISheet } from "~/src/store/sheet";
import { BaseComponent } from "~/src/components/base.component";
import { eventNames } from "~/src/util/event-names";

interface ITreeSheet {
  sheet: ISheet;
  level: number;
}

@Component
export default class SheetsComponent extends BaseComponent {
  treeSheets: ITreeSheet[] = [];
  newSheetParent: string = "";
  newSheetName: string = "";

  get sheets() {
    return this.$myStore.sheet.sheets;
  }

  async created(): Promise<void> {
    this.$root.$on(eventNames.sheet.reload, () => this.rebuildTreeSheets());
    this.rebuildTreeSheets();
  }

  select(sheet: ISheet): void {
    this.$myStore.sheet.a_selectCurrentSheet(sheet.name);
  }

  showAddModal(): void {
    this.newSheetParent = this.$myStore.sheet.currentSheet?.name ?? "";
    this.newSheetName = "";
  }

  async submitAddModal(e: Event): Promise<void> {
    if (
      await this.$myStore.sheet.a_add({
        name: this.newSheetName,
        parentName: this.$myStore.sheet.currentSheet?.name ?? "",
      })
    ) {
      this.$bvModal.hide("add-modal");
      this.rebuildTreeSheets();
    } else {
      e.preventDefault();
    }
  }

  showEditModal(): void {
    this.newSheetParent = this.$myStore.sheet.currentSheet?.parent ?? "";
    this.newSheetName = this.$myStore.sheet.currentSheet?.name ?? "";
  }

  async submitEditModal(e: Event): Promise<void> {
    if (
      await this.$myStore.sheet.a_edit({
        oldName: this.$myStore.sheet.currentSheet?.name ?? "",
        newName: this.newSheetName,
        parentName: this.newSheetParent,
      })
    ) {
      this.$bvModal.hide("edit-modal");
      this.rebuildTreeSheets();
    } else {
      e.preventDefault();
    }
  }

  remove(): void {
    this.$myStore.sheet.a_remove();
    this.rebuildTreeSheets();
  }

  notSelfOrChildTreeSheets(treeSheets: ITreeSheet[]): ITreeSheet[] {
    return _.filter(treeSheets, (treeSheet) => {
      const sheetName = treeSheet.sheet.name;
      if (sheetName === this.$myStore.sheet.currentSheet?.name) return false;
      if (!this.$myStore.sheet.sheets[sheetName]) return true;
      return !this.$myStore.sheet.g_isParentRecursive(
        this.$myStore.sheet.sheets[sheetName],
        this.$myStore.sheet.currentSheet
      );
    });
  }

  rebuildTreeSheets(): void {
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
