class Product {
    id;
    name;
    order;

    /**
     * 商品类
     * @param {number} id 
     * @param {string} name 
     * @param {number?} order
     */
    constructor(id, name, order) {
        this.id = id;
        this.name = name;
        this.order = order;
    }
}

module.exports = Product