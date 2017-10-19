import "reflect-metadata";

import log = require("loglevel");
(<any>window).log = log;
log.setLevel("trace");

import "./etc/ace-custom-snippets";

import Vue from "vue";
import BootstrapVue from "bootstrap-vue";

Vue.use(BootstrapVue);

let AppComponent = require("./component/app.component.vue").default;
new AppComponent().$mount("#app");
