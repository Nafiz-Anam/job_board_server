require("dotenv").config();
const UserModel = require("../model/userModel");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");

var ReviewController = {
    add_review: async (req, res) => {
        try {
            let review_data = {
                review_from: req.user.id,
                review_to: enc_dec.decrypt(req.bodyString("review_to")),
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

            let condition = {};

            if (req.bodyString("job_id")) {
                condition.job_id = enc_dec.decrypt(req.bodyString("job_id"));
            }
            if (req.bodyString("service_id")) {
                condition.service_id = enc_dec.decrypt(
                    req.bodyString("service_id")
                );
            }
            if (req.bodyString("review_from")) {
                condition.review_from = enc_dec.decrypt(
                    req.bodyString("review_from")
                );
            }
            if (req.bodyString("review_to")) {
                condition.review_to = enc_dec.decrypt(
                    req.bodyString("review_to")
                );
            }

            await UserModel.select_list(condition, {}, limit, "reviews", {})
                .then(async (result) => {
                    let response = [];
                    for (val of result) {
                        temp = {
                            id: val?.id ? await enc_dec.encrypt(val?.id) : "",
                            job_id: val?.job_id
                                ? await enc_dec.encrypt(val?.job_id)
                                : "",
                            service_id: val?.service_id
                                ? await enc_dec.encrypt(val?.service_id)
                                : "",
                            review_from: val?.review_from
                                ? await enc_dec.encrypt(val?.review_from)
                                : "",
                            review_to: val?.review_to
                                ? await enc_dec.encrypt(val?.review_to)
                                : "",
                            rating: val?.rating ? val?.rating : 0,
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
