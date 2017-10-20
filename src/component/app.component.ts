import Component from "vue-class-component";

import BaseComponent from "./base.component";
import {MenuService} from "../service/menu.service";
import {container} from "../inversify.config";

@Component({
  components: {
    "menu-component": require("./menu.component.vue").default,
    "sheets-component": require("./sheets.component.vue").default,
    "search-component": require("./search.component.vue").default,
    "column-component": require("./column.component.vue").default,
    "spreadsheet-component": require("./spreadsheet.component.vue").default,
    "code-editor-component": require("./code-editor.component.vue").default,
  },
})
export default class AppComponent extends BaseComponent {

  menuService: MenuService = container.get(MenuService);

}
