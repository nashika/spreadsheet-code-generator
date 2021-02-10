import FieldNode from "../code/field";
import ModelNode from "../code/model";
import NodeBase from "./base";

type TFieldNodeChildren = {};

export interface IFieldNodeData {
  model: string;
  field: string;
  label: string;
  type: "string" | "number" | "boolean" | "division" | "belongsTo" | "datetime";
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

export interface IFieldNodeExport {
  model: string;
  field: string;
  label: string;
  type: "string" | "number" | "boolean" | "division" | "belongsTo" | "datetime";
  format?: string;
  options?: any;
  width?: number;
  display?: {
    list?: any;
    view?: any;
    edit?: any;
  };
}

export default class FieldNodeBase extends NodeBase {
  readonly data!: IFieldNodeData;
  readonly parent!: ModelNode;
  readonly siblings!: { [nodeName: string]: FieldNode };
  readonly children!: TFieldNodeChildren;

  toObject(): IFieldNodeExport {
    return <any>super.toObject();
  }
}
