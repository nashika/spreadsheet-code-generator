<template lang="pug">
section.data(style="height:100%")
  .message(v-if="$myStore.hub.mode == 'data' && $myStore.sheet.currentSheet && $myStore.sheet.currentSheet.name === 'root'") root sheet can not have data, please select or create new sheet.
  .spreadsheet-area(v-show="$myStore.sheet.currentSheet.name !== 'root'", style="height:100%")
    #spreadsheet(style="height:100%")
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";
import Handsontable from "handsontable";
import _ from "lodash";

import { BaseComponent } from "~/src/components/base.component";
import { IColumn } from "~/src/store/sheet";
import { RecordExtender } from "~/src/util/record-extender";
import { assertIsDefined } from "~/src/util/assert";
import { TSheetData } from "~/src/store/hub";
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
    // TODO: recover
    this.$root.$on(eventNames.search, this.onSearch);
    this.$root.$on(eventNames.data.insert, this.onInsert);
    this.$root.$on(eventNames.sheet.change, () => this.rebuildSpreadsheet());
    // this.$root.$on("showMenu", () => this.watchShowMenu());
    window.addEventListener("resize", this.resize);
    this.rebuildSpreadsheet();
    await Promise.resolve();
  }

  async beforeDestroy() {
    this.storeEditingData();
    window.removeEventListener("resize", this.resize);
    await Promise.resolve();
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
        this.$myStore.sheet.currentSheet.data,
        this.$myStore.sheet.currentSheet
      );
      this.hot?.render();
    }, 1000);
  }

  private afterScroll(): void {
    this.$myStore.sheet.m_mergeSheet({
      value: {
        meta: {
          colOffset: this.hot?.colOffset?.(),
          rowOffset: this.hot?.rowOffset?.(),
        },
      },
    });
  }

  private storeEditingData(): void {
    if (!this.hot) return;
    this.$myStore.sheet.m_mergeSheet({
      name: this.editingSheetName,
      value: { data: this.editingData },
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
    this.recordExtender = new RecordExtender(currentSheet.data, currentSheet);
    const container: Element | null = this.$el.querySelector("#spreadsheet");
    assertIsDefined(container);
    const sheetName: string = currentSheet.name;
    this.editingSheetName = currentSheet.name;
    this.editingData = _.cloneDeep(currentSheet.data);
    if (!sheetName) return;
    this.hot = new Handsontable(container, {
      data: this.editingData,
      width: this.$el.clientWidth - 1,
      height: this.$el.clientHeight - 1,
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
      /* TODO: recover
      cells: (_row: number, _col: number, _prop: any) => {
        let cellProperties: Handsontable.DefaultSettings = {};
        cellProperties.renderer = <any>this.customRenderer;
        return cellProperties;
      },
       */
    });
    this.hot.scrollViewportTo(
      currentSheet.meta.rowOffset ?? 0,
      currentSheet.meta.colOffset ?? 0
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

<style lang="scss">
.message {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
