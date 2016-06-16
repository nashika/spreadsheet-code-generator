export class Tag {

  id;
  name;
  created;
  modified;

  params = {
    "id": {
      "model": "Tag",
      "field": "id",
      "label": "ID",
      "type": "number",
      "width": 40
    },
    "name": {
      "model": "Tag",
      "field": "name",
      "label": "Name",
      "type": "string"
    },
    "created": {
      "model": "Tag",
      "field": "created",
      "label": "Created",
      "type": "datetime",
      "format": "YYYY/MM/DD",
      "width": 120
    },
    "modified": {
      "model": "Tag",
      "field": "modified",
      "label": "Updated",
      "type": "datetime",
      "format": "YYYY/MM/DD",
      "width": 120
    }
  }

}
