import Component from "vue-class-component";

import {BaseComponent} from "./base-component";
import {templateLoader} from "./template-loader";

@Component({
  template: templateLoader("search"),
  components: {},
  props: [],
})
export class SearchComponent extends BaseComponent {

  query: string;

  data() {
    return {
      query: "",
    };
  }

  search() {
    if (!this.query) return;
    this.$root.$broadcast("search", this.query);
  }

}
