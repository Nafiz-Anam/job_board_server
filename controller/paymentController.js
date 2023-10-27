require("dotenv").config();
const CategoryModel = require("../model/categoryModel");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");
const STATIC_URL = process.env.STATIC_FILE_URL;

var PaymentController = {
    list: async (req, res) => {
        try {
            let limit = {
                perpage: 0,
                start: 0,
            };
            if (req.bodyString("perpage") && req.bodyString("page")) {
                perpage = parseInt(req.bodyString("perpage"));
                start = parseInt(req.bodyString("page"));
                limit.perpage = perpage;
                limit.start = (start - 1) * perpage;
            }

            let condition = {};

            const totalCount = await CategoryModel.get_count(condition);
            console.log(totalCount);

            await CategoryModel.select_list(condition, limit)
                .then(async (result) => {
                    console.log(result);
                    let response = [];
                    for (let val of result) {
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            name: val?.name ? val?.name : "",
                            service_image: val?.service_image
                                ? val?.service_image
                                : "",
                            status: val?.status ? val?.status : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Category fetched successfully!",
                        total: totalCount,
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        data: {},
                        error: "Server side error!",
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                data: {},
                error: "Server side error!",
            });
        }
    },
};

module.exports = PaymentController;
