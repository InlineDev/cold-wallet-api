class UserValidator {
    async infoUser(req, res, next) {
        next(); //нет параметров
    }
}

export default new UserValidator();