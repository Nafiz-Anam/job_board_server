const MerchantModel = require("../../models/merchantmodel");
const StatusCode = require("../statuscode/index");
const ServerResponse = require("../response/ServerResponse");

module.exports = async function AuthenticateAccessToken(req, res, next) {
    const authHeader = req.headers;
    const request_data = {
        secret_key: authHeader.secret_key,
        api_key: authHeader.api_key,
    };
    let result = await MerchantModel.select_merchant(request_data);
    if (result) {
        user = {
            id: result[0].id,
            type: "merchant",
        };
        req.user = user;
        let merchant_request = {
            request: JSON.stringify(req.body),
            status: 0,
            merchant_id: user.id,
        };
        let add_request_list = await MerchantModel.add_request_list(
            merchant_request
        );
        req.user.request_id = add_request_list.insertId;
        next();
    } else {
        res.status(StatusCode.badRequest).send(
            ServerResponse.validationResponse("Unauthorized request", "E0001")
        );
    }
};
