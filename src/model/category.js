export default class Category {
    id;
    name;
    product_id;
    parent_id;

    /**
     * 商品类
     * @param {number} id 
     * @param {string} name 
     * @param {number} [parent_id] 
     * @param {number} [product_id]
     */
    constructor(id, name, product_id = null, parent_id = null) {
        this.id = id;
        this.name = name;
        this.product_id = product_id;
        this.parent_id = parent_id;
    }
}