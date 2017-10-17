div.panel.panel-default
  div.panel-heading #[i.fa.fa-search] Search
  ul.list-group
    li.list-group-item
      form.form-horizontal(@submit.prevent="search")
        div.input-group
          input.form-control(type="text", v-model="query", placeholder="Search for...")
          span.input-group-btn
            button.btn.btn-primary(type="submit") #[i.fa.fa-search]
