export class Comment {
  id!: number;
  orderNo!: number;
  articleId!: Object;
  authorId!: Object;
  content!: string;
  created!: Date;
  modified!: Date;

  params = {
    "id": {
      "model": "Comment",
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
    "order_no": {
      "model": "Comment",
      "field": "order_no",
      "label": "Order",
      "type": "number"
    },
    "article_id": {
      "model": "Comment",
      "field": "article_id",
      "label": "Article",
      "type": "belongsTo"
    },
    "author_id": {
      "model": "Comment",
      "field": "author_id",
      "label": "Author",
      "type": "belongsTo"
    },
    "content": {
      "model": "Comment",
      "field": "content",
      "label": "Content",
      "type": "string"
    },
    "created": {
      "model": "Comment",
      "field": "created",
      "label": "Created",
      "type": "datetime",
      "format": "YYYY/MM/DD",
      "width": 120,
      "display": {
        "list": false,
        "view": true,
        "edit": false
      }
    },
    "modified": {
      "model": "Comment",
      "field": "modified",
      "label": "Updated",
      "type": "datetime",
      "format": "YYYY/MM/DD",
      "width": 120,
      "display": {
        "list": false,
        "view": true,
        "edit": false
      }
    }
  }

  initializeAssociation() {
    this.setAssociation("article", {
      type: "belongsTo",
      model: "Article",
      foreignKey: "article_id",
    });
    this.setAssociation("author", {
      type: "belongsTo",
      model: "Author",
      foreignKey: "author_id",
    });
  }

}
