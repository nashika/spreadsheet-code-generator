import {IColumnDefinition, Application} from "../application";

export class ColumnComponent {
  
  constructor(private app:Application) {}

  public selectColumn = (index:number):void => {
    let columnDefinition:IColumnDefinition = this.app.currentSheetDefinition.columns[index];
    let colHeader:string = this.app.currentSheetDefinition.colHeaders[index];
    $("#column-header").val(colHeader);
    $("#column-data").val(columnDefinition.data);
    $("#column-type").val(columnDefinition.type);
    $("#column-width").val(columnDefinition.width);
  };

}
