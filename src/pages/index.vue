<template lang="pug">
.container
  div
    h1.title spreadsheet-code-generator
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";

import { BaseComponent } from "~/src/components/base.component";
import { NuxtContext } from "~/src/types/nuxt";

@Component
export default class IndexComponent extends BaseComponent {
  async fetch(context: NuxtContext): Promise<void> {
    context.redirect(301, "/data");
    return await Promise.resolve();
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}
</style>
