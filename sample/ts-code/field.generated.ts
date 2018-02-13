import FieldGeneratorNode from "../code/field";
import ModelGeneratorNode from "../code/model";

export interface IFieldGeneratorNodeData {
  model: string;
  field: string;
  label: string;
  type: string;
  format?: string;
  options?: any;
  width?: number;
  sysinfo?: string;
  display?: {
    list?: any;
    view?: any;
    edit?: any;
  };
}

export interface IFieldGeneratorNodeExport {
  model: string;
  field: string;
  label: string;
  type: string;
  format?: string;
  options?: any;
  width?: number;
  display?: {
    list?: any;
    view?: any;
    edit?: any;
  };
}

type TFieldGeneratorNodeChildren = {
}

export default class FieldGeneratorNodeGenerated extends scg.GeneratorNode {

  readonly data: IFieldGeneratorNodeData;
  readonly parent: ModelGeneratorNode;
  readonly siblings: { [nodeName: string]: FieldGeneratorNode };
  readonly children: TFieldGeneratorNodeChildren;
  
  toObject(): IFieldGeneratorNodeExport {
    return <any>super.toObject();
  }

}
