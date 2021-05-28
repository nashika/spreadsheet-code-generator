<template lang="pug">
section.data
  .message(v-if="$myStore.sheet.currentSheet && $myStore.sheet.currentSheet.name === 'root'") root sheet can not have data, please select or create new sheet.
  .spreadsheet-area(v-show="$myStore.sheet.currentSheet.name !== 'root'")
    #spreadsheet(style="height:100%")
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";
import Handsontable from "handsontable";
import _ from "lodash";

import { BaseComponent } from "~/src/components/base.component";
import { IColumn, TSheetData } from "~/src/store/sheet";
import { RecordExtender } from "~/src/util/record-extender";
import { assertIsDefined } from "~/src/util/assert";
import { eventNames } from "~/src/util/event-names";

@Component
export default class DataComponent extends BaseComponent {
  private currentRow: number = 0;
  private currentCol: number = 0;
  private resizeTimer: any = null;
  private editingData: TSheetData = [];
  private editingSheetName: string = "";

  private hot?: Handsontable;
  private recordExtender?: RecordExtender;

  async mounted() {
    this.$root.$on(eventNames.search, this.search);
    this.$root.$on(eventNames.data.insert, this.insert);
    this.$root.$on(eventNames.sheet.change, this.rebuildSpreadsheet);
    this.$root.$on(eventNames.menu.save, this.save);
    this.$root.$on(eventNames.menu.toggle, this.resize);
    window.addEventListener("resize", this.resize);
    this.rebuildSpreadsheet();
    await Promise.resolve();
  }

  async beforeDestroy() {
    this.$root.$off(eventNames.search, this.search);
    this.$root.$off(eventNames.data.insert, this.insert);
    this.$root.$off(eventNames.sheet.change, this.rebuildSpreadsheet);
    this.$root.$off(eventNames.menu.save, this.save);
    this.$root.$off(eventNames.menu.toggle, this.resize);
    window.removeEventListener("resize", this.resize);
    this.storeEditingData();
    await Promise.resolve();
  }

  search(query: string) {
    if (!this.hot) return;
    const search = this.hot.getPlugin("search");
    const queryResults = search.query(query);
    if (!queryResults.length) return;
    let queryResultSelect: any;
    for (const queryResult of queryResults) {
      if (this.currentRow > queryResult.row) continue;
      if (this.currentRow === queryResult.row) {
        if (this.currentCol >= queryResult.col) continue;
      }
      queryResultSelect = queryResult;
      break;
    }
    if (!queryResultSelect) queryResultSelect = queryResults[0];
    this.hot.selectCell(queryResultSelect.row, queryResultSelect.col);
    this.hot.render();
  }

  insert() {
    this.hot?.alter("insert_row", this.currentRow);
  }

  save(as: boolean = false) {
    this.storeEditingData();
    this.$myStore.menu.a_save(as);
  }

  resize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.rebuildSpreadsheet();
    }, 200);
  }

  private makeValidator(
    column: IColumn
  ): (value: string, callback: (result: boolean) => void) => void {
    return function (
      this: Handsontable._editors.Base,
      value: string,
      callback: (result: boolean) => void
    ): void {
      if (column.json && value !== "") {
        try {
          JSON.parse(value);
        } catch (e) {
          // eslint-disable-next-line node/no-callback-literal
          return callback(false);
        }
      }
      // eslint-disable-next-line node/no-callback-literal
      return callback(true);
    };
  }

  private afterSelection(r: number, c: number, _r2: number, _c2: number): void {
    this.currentRow = r;
    this.currentCol = c;
    setTimeout(() => {
      this.$root.$emit(eventNames.data.selectColumn, c);
    }, 0);
  }

  private afterChange(
    changes: Handsontable.CellChange[] | null,
    _source: Handsontable.ChangeSource
  ): void {
    if (changes) {
      this.$myStore.sheet.a_setModified({ value: true });
    }
    if (changes && changes.length > 0) {
      this.setReloadRecordExtenderTimer();
    }
  }

  private reloadRecordExtenderTimer: any;
  private setReloadRecordExtenderTimer(): void {
    if (this.reloadRecordExtenderTimer)
      clearTimeout(this.reloadRecordExtenderTimer);
    this.reloadRecordExtenderTimer = setTimeout(() => {
      this.recordExtender = new RecordExtender(
        this.$myStore.sheet.currentSheet
      );
      this.hot?.render();
    }, 1000);
  }

  private afterScroll(): void {
    this.$myStore.sheet.a_setOffset({
      colOffset: this.hot?.colOffset?.(),
      rowOffset: this.hot?.rowOffset?.(),
    });
  }

  private storeEditingData(): void {
    if (!this.hot) return;
    if (
      _.isEqual(
        this.editingData,
        this.$myStore.sheet.sheets[this.editingSheetName].data
      )
    )
      return;
    this.$myStore.sheet.a_setData({
      name: this.editingSheetName,
      data: this.editingData,
    });
  }

  private rebuildSpreadsheet(): void {
    if (this.hot) {
      this.storeEditingData();
      this.hot.destroy();
      this.hot = undefined;
    }
    if (this.$myStore.sheet.currentSheet.name === "root") return;
    const currentSheet = this.$myStore.sheet.currentSheet;
    this.recordExtender = new RecordExtender(currentSheet);
    const container: Element | null = this.$el.querySelector("#spreadsheet");
    assertIsDefined(container);
    const sheetName: string = currentSheet.name;
    this.editingSheetName = currentSheet.name;
    this.editingData = _.cloneDeep(currentSheet.data);
    if (!sheetName) return;
    this.hot = new Handsontable(container, {
      data: this.editingData,
      width: "100%",
      height: "100%",
      columns: currentSheet.columns.map((c: IColumn) => {
        const columnSetting: Handsontable.ColumnSettings = {};
        switch (c.type) {
          case "text":
            columnSetting.type = "text";
            break;
          case "select":
            columnSetting.editor = "select";
            columnSetting.selectOptions = c.options;
            break;
          case "numeric":
            columnSetting.type = "numeric";
            break;
        }
        if (c.json || c.required) {
          columnSetting.validator = this.makeValidator(c);
          columnSetting.invalidCellClassName = "invalid-cell";
          columnSetting.allowInvalid = true;
        }
        columnSetting.renderer = this.customRenderer;
        columnSetting.data = c.data;
        return columnSetting;
      }),
      rowHeaders: true,
      colHeaders: currentSheet.columns.map((c) => c.header),
      colWidths: currentSheet.columns.map((c) => c.width),
      contextMenu: true,
      wordWrap: false,
      manualColumnFreeze: true,
      fixedColumnsLeft: currentSheet.freezeColumn || 0,
      search: {
        searchResultClass: "search-cell",
      },
      currentRowClassName: "current-row",
      currentColClassName: "current-col",
      afterChange: this.afterChange,
      afterSelection: this.afterSelection,
      afterScrollHorizontally: this.afterScroll,
      afterScrollVertically: this.afterScroll,
      autoRowSize: false,
      autoColumnSize: false,
      licenseKey: "non-commercial-and-evaluation",
    });
    this.hot.scrollViewportTo(
      currentSheet.meta.rowOffset ?? 0,
      currentSheet.meta.colOffset ?? 0
    );
  }

  private customRenderer(
    instance: Handsontable,
    td: HTMLTableCellElement,
    row: number,
    col: number,
    prop: string | number,
    value: Handsontable.CellValue,
    cellProperties: Handsontable.CellProperties
  ): HTMLTableCellElement | void {
    if (typeof prop !== "string")
      throw new TypeError("typeof prop is not string.");
    if (_.isNull(value) || value === "") {
      assertIsDefined(this.recordExtender);
      const parentPathStr: string = instance.getDataAtRowProp(row, "extends");
      if (parentPathStr) {
        let data: any = this.recordExtender.get(parentPathStr, prop);
        if (data === false)
          data = this.recordExtender.get(
            parentPathStr +
              "." +
              instance.getDataAtRowProp(row, this.recordExtender.lastPathField),
            prop
          );
        if (data === false) {
          td.style.backgroundColor = "#fbb";
        } else if (!_.isUndefined(data)) {
          value = data;
          td.style.color = "#bbf";
        }
      }
    }
    const column = this.$myStore.sheet.currentSheet.columns[col];
    if (column.required) {
      if (_.isNull(value) || value === "") {
        const firstCellData = instance.getDataAtCell(row, 0);
        if (firstCellData && !_.startsWith(firstCellData, "*"))
          td.style.backgroundColor = "#f88";
      }
    }
    switch (cellProperties.type) {
      case "text":
      case "select":
        Handsontable.renderers.TextRenderer.apply(this, [
          instance,
          td,
          row,
          col,
          prop,
          value,
          cellProperties,
        ]);
        break;
      case "numeric":
        Handsontable.renderers.NumericRenderer.apply(this, [
          instance,
          td,
          row,
          col,
          prop,
          value,
          cellProperties,
        ]);
        break;
      default:
        throw new Error("Unknown type.");
    }
  }
}
</script>

<style lang="scss">
@import "../../node_modules/handsontable/dist/handsontable.full.css";

section.data {
  width: 100%;
  height: 100%;
}

.message {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.spreadsheet-area {
  width: 100%;
  height: 100%;
}

.current-row {
  background-color: #f8f8f8;
}
.current-col {
  background-color: #f8f8f8;
}
.search-cell {
  background-color: #fcedd9 !important;
}
.invalid-cell {
  background-color: #f88 !important;
}
</style>
