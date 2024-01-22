import responseSuccess from "../../answer/v1/responseSuccess.js";
import withdrawalService from "../../service/v1/withdrawalService.js";
import responseError, { errorObject } from "../../answer/v1/responseError.js";

type typeSendCoin =
    {
        status: string;
        data: { hash?: string };
        error: { message?: string };
        logErr?: string,
    };

class WithdrawalController {
    async sendCoin(req, res, next) {
        try {
            const sendCoin: typeSendCoin = await withdrawalService.sendCoin(req.user, req.query.coin, Number(req.query.amount), req.query.address, req.query.date);
            if (sendCoin.status === "error") return next(responseError(res, next, sendCoin.logErr, errorObject(sendCoin.error.message)));

            return next(responseSuccess(res, next, sendCoin));
        } catch (err) {
            return next(responseError(res, next, err, errorObject("unforeseen!")));
        }
    }
}

export default new WithdrawalController();