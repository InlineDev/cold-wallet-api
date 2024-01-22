import jwt from "jsonwebtoken";
import config from "../../config.js";

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, config.secretAccessKey, { expiresIn: "1m" });
        return accessToken;
    }

    validateAccessToken(token: string) {
        try {
            const userData = jwt.verify(token, config.secretAccessKey);
            return userData;
        } catch (e) {
            return null;
        }
    }
}

export default new TokenService();