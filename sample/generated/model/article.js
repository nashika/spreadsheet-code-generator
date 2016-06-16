export class Article {

  id;
  title;
  type;
  content;
  category_id;
  author_id;
  public;
  created;
  modified;

  params = {
    "id": {
      "model": "Article",
      "field": "id",
      "label": "ID",
      "type": "number",
      "width": 40
    },
    "title": {
      "model": "Article",
      "field": "title",
      "label": "Title",
      "type": "string",
      "width": 120
    },
    "type": {
      "model": "Article",
      "field": "type",
      "label": "Type",
      "type": "division"
    },
    "content": {
      "model": "Article",
      "field": "content",
      "label": "Content",
      "type": "string",
      "width": 200
    },
    "category_id": {
      "model": "Article",
      "field": "category_id",
      "label": "Category",
      "type": "belongsTo",
      "width": 80
    },
    "author_id": {
      "model": "Article",
      "field": "author_id",
      "label": "Author",
      "type": "belongsTo",
      "width": 80
    },
    "public": {
      "model": "Article",
      "field": "public",
      "label": "Public",
      "type": "boolean"
    },
    "created": {
      "model": "Article",
      "field": "created",
      "label": "Created",
      "type": "datetime",
      "format": "YYYY/MM/DD",
      "width": 80
    },
    "modified": {
      "model": "Article",
      "field": "modified",
      "label": "Updated",
      "type": "datetime",
      "format": "YYYY/MM/DD",
      "width": 80
    }
  }

}
