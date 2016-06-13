import fs = require("fs");
import path = require("path");

import electron = require("electron");

import {BaseService} from "./base-service";

export class GeneratorService extends BaseService {
  
  public generate():void {
    console.log("generate");
  }
  
}
