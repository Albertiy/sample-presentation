export default class ProductItem {
    id;
    name;
    productId;
    linkUrl;
    mainPic;
    categoryList;

    /**
     * 
     * @param {number} id 
     * @param {string} name 
     * @param {number} productId 
     * @param {string} linkUrl 
     * @param {string} mainPic 
     * @param {[]} categoryList 
     */
    constructor(id, name, productId, linkUrl, mainPic, categoryList = []) {
        this.id = id;
        this.name = name;
        this.productId = productId;
        this.linkUrl = linkUrl;
        this.mainPic = mainPic;
        this.categoryList = categoryList;


    }


}