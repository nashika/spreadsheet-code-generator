import { Vue } from "nuxt-property-decorator";
import _ from "lodash";
import "bootstrap-vue";

import { NuxtContext } from "~/src/types/nuxt";

export abstract class BaseComponent extends Vue {
  lodash = _;

  // instance lifecycle hooks
  async beforeCreate() {}
  async created() {}
  async beforeMount() {}
  async mounted() {}
  async beforeUpdate() {}
  async updated() {}
  async beforeDestroy() {}
  async destroyed() {}

  // nuxt hooks
  async fetch(_context: NuxtContext) {}
  async asyncData(_context: NuxtContext) {}
}
