import responseSuccess from "../../answer/v1/responseSuccess.js";
import responseError, { errorObject } from "../../answer/v1/responseError.js";
import balanceService from "../../service/v1/balanceService.js";

class BalanceController {
    async balance(req, res, next) {
        try {
            const balance = await balanceService.balance(req.user);
            if (balance.status === "error") return next(responseError(res, next, balance.logErr, errorObject(balance.error.message)));

            return next(responseSuccess(res, next, balance));
        } catch (err) {
            return next(responseError(res, next, err, errorObject("unforeseen!")));
        }
    }
}

export default new BalanceController();