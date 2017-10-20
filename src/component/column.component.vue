<template lang="pug">
  mixin form-group(title)
    div.form-group
      label.control-label(class="col-xs-4")= title
      div(class="col-xs-8")
        block

  .column-component
    div.panel.panel-default()
      div.panel-heading #[i.fa.fa-columns] Manage Column
      ul.list-group
        li.list-group-item
          button.btn.btn-success.btn-block(@click="add") #[i.fa.fa-plus] Add
        li.list-group-item(v-if="column")
          form.form-horizontal(@submit.prevent="modify")
            +form-group("Header")
              input.form-control(type="text", v-model="column.header", required)
            +form-group("Data")
              input.form-control(type="text", v-model="column.data", required)
            +form-group("Type")
              select.form-control(v-model="column.type")
                option(value="text") Text
                option(value="select") Select
                option(value="numeric") Numeric
            div(v-if="column.type == 'text' || column.type == 'select'")
              +form-group("JSON")
                div.checkbox
                  label
                    input(type="checkbox", v-model="column.json")
            div(v-if="column.type == 'select'")
              +form-group("Options")
                textarea.form-control(rows=5, v-model="optionsText", lazy)
            +form-group("Width")
              input.form-control(type="number", v-model="column.width", required, number)
            button.btn.btn-primary.btn-block(type="submit") #[i.fa.fa-save] Modify
        li.list-group-item(v-if="column")
          div.row
            div.col-xs-6
              button.btn.btn-block.btn-warning(@click="move(false)", :disabled="columnIndex == 0") #[i.fa.fa-arrow-left] Left
            div.col-xs-6
              button.btn.btn-block.btn-warning(@click="move(true)", :disabled="columnIndex == $hub.currentSheet.columns.length - 1") Right #[i.fa.fa-arrow-right]
        li.list-group-item(v-if="column")
          div.row
            div.col-xs-12
              button.btn.btn-block.btn-danger(@click="remove()") #[i.fa.fa-trash] Delete
        li.list-group-item(v-if="column")
          div.row
            div.col-xs-12
              button.btn.btn-block.btn-primary(@click="freeze()", :class="{'active': columnIndex + 1 == $hub.currentSheet.freezeColumn}") #[i.fa.fa-map-pin] Freeze Column
</template>

<script lang="ts" src="./column.component.ts"></script>
