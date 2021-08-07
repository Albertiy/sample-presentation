class ReqBody {
    /**
     * 路由返回体
     * @param {number} state 1：正常，0：错误，其他：自定义
     * @param {*} [data]
     * @param {*} [error] 
     */
    constructor(state, data, error) {
        this.state = state;
        this.data = data;
        this.error = error;
    }
}

module.exports = ReqBody;