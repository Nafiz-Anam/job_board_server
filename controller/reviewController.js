require("dotenv").config();
const UserModel = require("../model/userModel");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");

var ReviewController = {
    add_review: async (req, res) => {
        try {
            let review_data = {
                client_id: req.user.id,
                expert_id: enc_dec.decrypt(req.bodyString("expert_id")),
                service_id: enc_dec.decrypt(req.bodyString("service_id")),
                job_id: enc_dec.decrypt(req.bodyString("job_id")),
                rating: req.bodyString("rating"),
                review: req.bodyString("review"),
            };
            await helpers
                .common_add(review_data, "reviews")
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Review added successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to add review. Try again!",
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: "Server side error! Try again.",
            });
        }
    },

    list_reviews: async (req, res) => {
        try {
            let limit = {
                perpage: 10,
                start: 0,
            };
            if (req.bodyString("perpage") && req.bodyString("page")) {
                perpage = parseInt(req.bodyString("perpage"));
                start = parseInt(req.bodyString("page"));
                limit.perpage = perpage;
                limit.start = (start - 1) * perpage;
            }

            UserModel.select_review_list(limit)
                .then(async (result) => {
                    let response = [];
                    for (val of result) {
                        temp = {
                            id: val?.id ? await enc_dec.encrypt(val?.id) : "",
                            user_id: val?.user_id
                                ? await enc_dec.encrypt(val?.user_id)
                                : "",
                            start_count: val?.start_count
                                ? val?.start_count
                                : 0,
                            review: val?.review ? val?.review : "",
                            created_at: val?.created_at ? val?.created_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Reviews fetched successfully!",
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

module.exports = ReviewController;
