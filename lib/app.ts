import * as $ from "jquery";
(<any>window).jQuery = (<any>window).$ = $;
import "bootstrap";
import "font-awesome/css/font-awesome.css";

import "./scss/style.scss";
import {AppComponent} from "./component/app-component";

let app:AppComponent = new (<any>AppComponent)({el: "#app"});
