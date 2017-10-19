import Component from "vue-class-component";

import BaseComponent from "./base-component";

@Component({})
export default class SearchComponent extends BaseComponent {

  query: string = "";

  search() {
    if (!this.query) return;
    this.$hub.$emit("search", this.query);
  }

}
