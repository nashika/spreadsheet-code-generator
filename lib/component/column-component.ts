import {IDefinitionColumn, Application} from "../application";

export class ColumnComponent {
  
  constructor(private app:Application) {}

  public selectColumn = (index:number):void => {
    let columnDefinition:IDefinitionColumn = this.app.currentDefinition.columns[index];
    let colHeader:string = this.app.currentDefinition.colHeaders[index];
    $("#column-header").val(colHeader);
    $("#column-data").val(columnDefinition.data);
    $("#column-type").val(columnDefinition.type);
    $("#column-width").val(columnDefinition.width);
  };

}
