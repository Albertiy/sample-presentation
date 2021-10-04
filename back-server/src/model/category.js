class Category {
    id;
    name;
    order;
    product_id;
    parent_id;

    /**
     * 商品类
     * @param {number} id 
     * @param {string} name 
     * @param {number} [order]
     * @param {number} [product_id]
     * @param {number} [parent_id] 
     */
    constructor(id, name, order = null, product_id = null, parent_id = null) {
        this.id = id;
        this.name = name;
        this.order = order;
        this.product_id = product_id;
        this.parent_id = parent_id;
    }
}

module.exports = Category;