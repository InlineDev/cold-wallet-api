
import responseError, { errorObject } from "../../answer/v1/responseError.js";

class BalanceValidator {
    async balance(req, res, next) {
        next(); //нет параметров
    }
}

export default new BalanceValidator();