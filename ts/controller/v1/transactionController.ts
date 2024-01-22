import responseSuccess from "../../answer/v1/responseSuccess.js";
import responseError, { errorObject } from "../../answer/v1/responseError.js";
import transactionService from "../../service/v1/transactionService.js";

class WithdrawalController {
    async find(req, res, next) {
        try {
            const sendCoin = await transactionService.find(req.user);
            if (sendCoin.status === "error") return next(responseError(res, next, sendCoin.logErr, errorObject(sendCoin.error.message)));

            return next(responseSuccess(res, next, sendCoin));
        } catch (err) {
            return next(responseError(res, next, err, errorObject("unforeseen!")));
        }
    }
}

export default new WithdrawalController();