import "font-awesome/css/font-awesome.css";

import log = require("loglevel");
(<any>window).log = log;
log.setLevel("trace");

import "./scss/style.scss";
import "./etc/ace-custom-snippets";
import {AppComponent} from "./component/app.component";

let app: AppComponent = new (<any>AppComponent)({el: "#app"});
