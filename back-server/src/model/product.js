class Product {
    id;
    name;

    /**
     * 商品类
     * @param {number} id 
     * @param {string} name 
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

module.exports = Product