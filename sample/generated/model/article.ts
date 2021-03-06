export class Article {
  id!: number;
  title!: string;
  type!: number;
  content!: string;
  categoryId!: Object;
  authorId!: Object;
  public!: boolean;
  created!: Date;
  modified!: Date;

  params = {
    name: "Article",
    label: "Article",
    fields: {
      "id": {
        "model": "Article",
        "field": "id",
        "label": "ID",
        "type": "number",
        "width": 40,
        "display": {
          "list": true,
          "view": true,
          "edit": false
        }
      },
      "title": {
        "model": "Article",
        "field": "title",
        "label": "Title",
        "type": "string",
        "width": 120,
        "display": {
          "list": true
        }
      },
      "type": {
        "model": "Article",
        "field": "type",
        "label": "Type",
        "type": "division",
        "options": {
          "1": "text",
          "2": "photo",
          "3": "movie",
          "4": "link"
        },
        "width": 80,
        "display": {
          "list": false
        }
      },
      "content": {
        "model": "Article",
        "field": "content",
        "label": "Content",
        "type": "string",
        "width": 200,
        "display": {
          "list": false
        }
      },
      "category_id": {
        "model": "Article",
        "field": "category_id",
        "label": "Category",
        "type": "belongsTo",
        "width": 80,
        "display": {
          "list": true
        }
      },
      "author_id": {
        "model": "Article",
        "field": "author_id",
        "label": "Author",
        "type": "belongsTo",
        "width": 80,
        "display": {
          "list": true
        }
      },
      "public": {
        "model": "Article",
        "field": "public",
        "label": "Public",
        "type": "boolean",
        "width": 40,
        "display": {
          "list": true
        }
      },
      "created": {
        "model": "Article",
        "field": "created",
        "label": "Created",
        "type": "datetime",
        "format": "YYYY/MM/DD",
        "width": 80,
        "display": {
          "list": false,
          "view": true,
          "edit": false
        }
      },
      "modified": {
        "model": "Article",
        "field": "modified",
        "label": "Updated",
        "type": "datetime",
        "format": "YYYY/MM/DD",
        "width": 80,
        "display": {
          "list": false,
          "view": true,
          "edit": false
        }
      }
    },
    association: {
      "author": {
        "model": "Article",
        "association": "author",
        "type": "belongsTo",
        "target": "Author",
        "foreignKey": "author_id"
      },
      "category": {
        "model": "Article",
        "association": "category",
        "type": "belongsTo",
        "target": "Category",
        "foreignKey": "category_id"
      },
      "tags": {
        "model": "Article",
        "association": "tags",
        "type": "belongsToMany",
        "target": "Tag",
        "foreignKey": "article_tag"
      },
      "comments": {
        "model": "Article",
        "association": "comments",
        "type": "hasMany",
        "target": "Comment",
        "foreignKey": "article_id"
      }
    },
  };
}
