class TransactionValidator {
    async find(req, res, next) {
        next(); //нет параметров
    }
}

export default new TransactionValidator();