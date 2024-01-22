
import responseError, { errorObject } from "../../answer/v1/responseError.js";

class WalletValidator {
    async walletAddresses(req, res, next) {
        next(); //нет параметров
    }
}

export default new WalletValidator();