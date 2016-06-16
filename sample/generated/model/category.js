export class Category {

  id;
  name;
  created;
  modified;

  params = {
    "id": {
      "model": "Category",
      "field": "id",
      "label": "ID",
      "type": "number",
      "width": 40
    },
    "name": {
      "model": "Category",
      "field": "name",
      "label": "Name",
      "type": "string"
    },
    "created": {
      "model": "Category",
      "field": "created",
      "label": "Created",
      "type": "datetime",
      "format": "YYYY/MM/DD",
      "width": 120
    },
    "modified": {
      "model": "Category",
      "field": "modified",
      "label": "Updated",
      "type": "datetime",
      "format": "YYYY/MM/DD",
      "width": 120
    }
  }

}
