class Account {
    id;
    name;
    password;
    newPassword;

    /**
     * 
     * @param {number} id 
     * @param {string} name 
     * @param {string} password 
     * @param {string} [newPassword]
     */
    constructor(id, name, password, newPassword) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.newPassword = newPassword;
    }
}

module.exports = Account;