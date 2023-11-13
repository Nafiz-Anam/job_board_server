require("dotenv").config();
const UserModel = require("../model/userModel");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");

var SettingsController = {
    add_faq: async (req, res) => {
        try {
            let faq_data = {
                question: req.bodyString("question"),
                answer: req.bodyString("answer"),
                status: req.bodyString("status"),
            };
            await helpers
                .common_add(faq_data, "faqs")
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Faq added successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to add faq. Try again!",
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

    list_faq: async (req, res) => {
        try {
            let condition = {};
            if (req.bodyString("status")) {
                condition.status = req.bodyString("status");
            }
            helpers
                .common_select_list(condition, {}, {}, "faqs", {})
                .then(async (result) => {
                    let response = [];
                    for (val of result) {
                        temp = {
                            id: val?.id ? await enc_dec.encrypt(val?.id) : "",
                            question: val?.question ? val?.question : "",
                            answer: val?.answer ? val?.answer : "",
                            status: val?.status == 0 ? "active" : "inactive",
                            created_at: val?.created_at ? val?.created_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Faqs fetched successfully!",
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

    add_terms_conditions: async (req, res) => {
        try {
            let data = {
                content: req.bodyString("content"),
                status: req.bodyString("status"),
            };
            await helpers
                .common_add(data, "terms_and_conditions")
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Terms and conditions added successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message:
                            "Unable to add Terms and conditions. Try again!",
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

    list_terms_conditions: async (req, res) => {
        try {
            let condition = {};
            if (req.bodyString("status")) {
                condition.status = req.bodyString("status");
            }
            helpers
                .common_select_list(
                    condition,
                    {},
                    {},
                    "terms_and_conditions",
                    {}
                )
                .then(async (result) => {
                    let response = [];
                    for (val of result) {
                        temp = {
                            id: val?.id ? await enc_dec.encrypt(val?.id) : "",
                            content: val?.content ? val?.content : "",
                            status: val?.status == 0 ? "active" : "inactive",
                            created_at: val?.created_at ? val?.created_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Terms and conditions fetched successfully!",
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

    add_privacy_policy: async (req, res) => {
        try {
            let data = {
                content: req.bodyString("content"),
                status: req.bodyString("status"),
            };
            await helpers
                .common_add(data, "privacy_policy")
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Privacy policy added successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to add Privacy policy. Try again!",
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

    list_privacy_policy: async (req, res) => {
        try {
            let condition = {};
            if (req.bodyString("status")) {
                condition.status = req.bodyString("status");
            }
            helpers
                .common_select_list(condition, {}, {}, "privacy_policy", {})
                .then(async (result) => {
                    let response = [];
                    for (val of result) {
                        temp = {
                            id: val?.id ? await enc_dec.encrypt(val?.id) : "",
                            content: val?.content ? val?.content : "",
                            status: val?.status == 0 ? "active" : "inactive",
                            created_at: val?.created_at ? val?.created_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Privacy policy fetched successfully!",
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

module.exports = SettingsController;
