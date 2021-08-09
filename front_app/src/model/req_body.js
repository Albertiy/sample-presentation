export default class ReqBody {
    /**
     * 
     * @param {number} state 
     * @param {*} data 
     * @param {*} error 
     */
    constructor(state, data, error) {
        this.state = state;
        this.data = data;
        this.error = error;
    }
}