<template lang="pug">
.column-component
  b-card(no-body)
    h6(slot="header")
      fa(icon="columns")
      | &nbsp;Manage Column
    b-list-group
      b-list-group-item
        b-button(variant="success", block, @click="add")
          fa(icon="plus")
          | &nbsp;Add
      b-list-group-item(v-if="column")
        b-form(@submit.prevent="modify")
          b-form-group(label="Header")
            b-form-input(type="text", v-model="column.header", required)
          b-form-group(label="Data")
            b-form-input(type="text", v-model="column.data", required)
          b-form-group(label="Type")
            b-form-select(v-model="column.type")
              option(value="text") Text
              option(value="select") Select
              option(value="numeric") Numeric
          template(v-if="column.type === 'text' || column.type === 'select'")
            b-form-group(label="JSON")
              b-form-checkbox(v-model="column.json") as JSON
          template(v-if="column.type === 'select'")
            b-form-group(label="Options")
              b-form-textarea(:rows="5", v-model="optionsText", lazy)
          b-form-group(label="Width")
            b-form-input(type="number", v-model="column.width", required)
          b-form-group(label="Required")
            b-form-checkbox(v-model="column.required")
          b-form-group(label="Export")
            b-form-checkbox(v-model="column.export")
          // b-form-group(label="Typescript Type")
            b-form-input(type="text", v-model="column.tsType")
          b-button(type="submit", variant="primary", block)
            fa(icon="save")
            | &nbsp;Modify
      b-list-group-item(v-if="column")
        .row
          .col-6
            b-button(variant="warning", block, @click="move(false)", :disabled="columnIndex === 0")
              fa(icon="arrow-left")
          .col-6
            b-button(variant="warning", block, @click="move(true)", :disabled="columnIndex === $myStore.sheet.currentSheet.columns.length - 1")
              fa(icon="arrow-right")
      b-list-group-item(v-if="column")
        .row
          .col-12
            b-button(variant="danger", block, @click="remove()")
              fa(icon="trash")
              | &nbsp;Delete
      b-list-group-item(v-if="column")
        .row
          .col-12
            b-button(variant="primary", block, @click="freeze()", :class="{'active': columnIndex + 1 === $myStore.sheet.currentSheet.freezeColumn}")
              fa(icon="map-pin")
              | &nbsp;Freeze Column
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";
import _ from "lodash";

import { BaseComponent } from "~/src/components/base.component";
import { IColumn } from "~/src/store/sheet";
import { eventNames } from "~/src/util/event-names";

@Component
export default class ColumnComponent extends BaseComponent {
  columnIndex: number = -1;
  column: IColumn | null = null;
  optionsText: string = "";

  async created() {
    this.$root.$on(eventNames.data.selectColumn, (index: number) =>
      this.selectColumn(index)
    );
    this.$root.$on(eventNames.sheet.change, () => (this.column = null));
  }

  add(): void {
    this.$myStore.sheet.a_addColumn(this.columnIndex);
  }

  modify(): void {
    const column = _.clone(this.column);
    if (!column) return;
    column.options = _.split(this.optionsText, "\n");
    this.$myStore.sheet.a_modifyColumn({ index: this.columnIndex, column });
  }

  move(right: boolean): void {
    this.$myStore.sheet.a_moveColumn({ index: this.columnIndex, right });
    this.columnIndex += right ? 1 : -1;
  }

  remove(): void {
    this.$myStore.sheet.a_removeColumn(this.columnIndex);
    this.columnIndex = 0;
    this.column = null;
  }

  freeze(): void {
    if (this.columnIndex + 1 === this.$myStore.sheet.currentSheet.freezeColumn)
      this.$myStore.sheet.a_freezeColumn(0);
    else this.$myStore.sheet.a_freezeColumn(this.columnIndex + 1);
  }

  selectColumn(index: number): void {
    if (index < 0) {
      this.columnIndex = -1;
      this.column = null;
      this.optionsText = "";
    } else {
      this.columnIndex = index;
      this.column = _.clone(this.$myStore.sheet.currentSheet.columns[index]);
      this.optionsText = _.join(this.column.options, "\n");
    }
  }
}
</script>
