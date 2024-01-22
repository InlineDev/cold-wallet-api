import responseError, { errorObject } from "../../answer/v1/responseError.js";

class WithdrawalValidator {
    async sendCoin(req, res, next) {
        try {
            const query: { coin: string, amount: number, address: string, date: string } = req.query;
            if (!query.coin) return next(responseError(res, next, "coin not found!", errorObject("coin not found!")));
            else if (!("amount" in query)) return next(responseError(res, next, "amount not found!", errorObject("amount not found!")));
            else if (!query.address) return next(responseError(res, next, "address not found!", errorObject("address not found!")));
            else if (!query.date) return next(responseError(res, next, "date not found!", errorObject("date not found!")));
            next();
        } catch (err) {
            return next(responseError(res, next, err, errorObject("unforeseen")));
        }

    }
}

export default new WithdrawalValidator();