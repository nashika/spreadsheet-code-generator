<template lang="pug">
section.data(style="height:100%")
  #main-message(v-if="$myStore.hub.mode == 'data' && $myStore.sheet.currentSheet && $myStore.sheet.currentSheet.name == 'root'") root sheet can not have data, please select or create new sheet.
  .spreadsheet-component(style="height:100%")
    div#spreadsheet(style="height:100%")
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";
import Handsontable from "handsontable";

import { BaseComponent } from "~/src/components/base.component";
import { IColumn } from "~/src/store/sheet";
import { RecordExtender } from "~/src/util/record-extender";
import { assertIsDefined } from "~/src/util/assert";

/* TODO: recover
interface IMyHandsontable extends Handsontable {
  search: {
    query(q: string): any;
  };
  scrollViewportTo: (row: number, column: number) => boolean;
}
 */

@Component
export default class DataComponent extends BaseComponent {
  private currentRow: number = 0;
  private currentCol: number = 0;
  private resizeTimer: any = null;

  private hot?: Handsontable;
  private recordExtender?: RecordExtender;

  async created() {
    // TODO: recover
    // this.$hub.$on("search", this.onSearch);
    // this.$hub.$on("insert", this.onInsert);
    this.$root.$on("change-sheet", () => this.rebuildSpreadsheet());
    // this.$root.$on("showMenu", () => this.watchShowMenu());
    // beforeDestroy: SpreadsheetComponent.prototype.onBeforeDestroy,
    await Promise.resolve();
  }

  async mounted() {
    window.addEventListener("resize", this.resize);
    this.rebuildSpreadsheet();
    return await Promise.resolve();
  }

  onSearch(query: string) {
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

  onInsert() {
    this.hot?.alter("insert_row", this.currentRow);
  }

  onBeforeDestroy() {
    window.removeEventListener("resize", this.resize);
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
      this.$root.$emit("select-column", c);
    }, 0);
  }

  private afterChange(
    changes: Handsontable.CellChange[] | null,
    _source: Handsontable.ChangeSource
  ): void {
    if (changes) {
      this.$myStore.sheet.currentSheet.meta.modified = true;
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
        this.$myStore.sheet.currentSheet.data,
        this.$myStore.sheet.currentSheet
      );
      this.hot?.render();
    }, 1000);
  }

  private afterScroll(): void {
    this.$myStore.sheet.currentSheet.meta.colOffset = this.hot?.colOffset?.();
    this.$myStore.sheet.currentSheet.meta.rowOffset = this.hot?.rowOffset?.();
  }

  private rebuildSpreadsheet(): void {
    if (this.hot) {
      this.hot.destroy();
      this.hot = undefined;
    }
    if (this.$myStore.sheet.currentSheet.name === "root") return;
    this.recordExtender = new RecordExtender(
      this.$myStore.sheet.currentSheet.data,
      this.$myStore.sheet.currentSheet
    );
    const container: Element | null = this.$el.querySelector("#spreadsheet");
    assertIsDefined(container);
    const sheetName: string = this.$myStore.sheet.currentSheet.name;
    if (!sheetName) return;
    this.hot = new Handsontable(container, {
      data: this.$myStore.sheet.g_getSheetData(sheetName),
      width: this.$el.clientWidth - 1,
      height: this.$el.clientHeight - 1,
      columns: this.$myStore.sheet.currentSheet.columns.map((c: IColumn) => {
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
        columnSetting.data = c.data;
        return columnSetting;
      }),
      rowHeaders: true,
      colHeaders: this.$myStore.sheet.currentSheet.columns.map((c) => c.header),
      colWidths: this.$myStore.sheet.currentSheet.columns.map((c) => c.width),
      contextMenu: true,
      wordWrap: false,
      manualColumnFreeze: true,
      fixedColumnsLeft: this.$myStore.sheet.currentSheet.freezeColumn || 0,
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
      /* TODO: recover
      cells: (_row: number, _col: number, _prop: any) => {
        let cellProperties: Handsontable.DefaultSettings = {};
        cellProperties.renderer = <any>this.customRenderer;
        return cellProperties;
      },
       */
    });
    this.hot.scrollViewportTo(
      this.$myStore.sheet.currentSheet.meta.rowOffset ?? 0,
      this.$myStore.sheet.currentSheet.meta.colOffset ?? 0
    );
  }

  private watchShowMenu(): void {
    if (this.hot) {
      this.rebuildSpreadsheet();
    }
  }

  /* TODO: recover
  private customRenderer(instance: IMyHandsontable, td: HTMLTableDataCellElement, row: number, col: number, prop: string, value: any, cellProperties: any) {
    if (_.isNull(value) || value === "") {
      assertIsDefined(this.recordExtender);
      let parentPathStr: string = instance.getDataAtRowProp(row, "extends");
      if (parentPathStr) {
        let data: any = this.recordExtender.get(parentPathStr, prop);
        if (data === false) data = this.recordExtender.get(parentPathStr + "." + instance.getDataAtRowProp(row, this.recordExtender.lastPathField), prop);
        if (data === false) {
          td.style.backgroundColor = "#fbb";
        } else if (!_.isUndefined(data)) {
          value = data;
          td.style.color = "#bbf";
        }
      }
    }
    let column = this.$myStore.sheet.currentSheet.columns[col];
    if (column.required) {
      if (_.isNull(value) || value === "") {
        let firstCellData = instance.getDataAtCell(row, 0);
        if (firstCellData && !_.startsWith(firstCellData, "*"))
          td.style.backgroundColor = "#f88";
      }
    }
    switch (cellProperties.type) {
      case "text":
      case "select":
        Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        break;
      case "numeric":
        Handsontable.renderers.NumericRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        break;
      default:
        throw new Error();
    }
  }
   */
}
</script>
