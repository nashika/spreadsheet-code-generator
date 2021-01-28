<template lang="pug">
</template>

<style lang="scss">
  #container, #row {
    height: 100%;
  }

  #menu-area {
    flex: 0 0 250px;
    height: 100vh;
    padding: 2px;
    overflow-y: scroll;

    > div {
      margin-bottom: 4px;
    }
  }

  #main-area {
    flex: 1 0 0;
    height: 100vh;
    padding: 0px;
  }
</style>

<script lang="ts" src="./app.component.ts"></script>
