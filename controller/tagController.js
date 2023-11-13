require("dotenv").config();
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");

var TagController = {
    add_tag: async (req, res) => {
        try {
            let found = await helpers.get_data_list("*", "tags", {
                tag: req.bodyString("tag"),
            });
            if (found.length == 0) {
                let data = {
                    tag: req.bodyString("tag"),
                };
                await helpers
                    .common_add(data, "tags")
                    .then((result) => {
                        res.status(200).json({
                            status: true,
                            message: "Tag added successfully!",
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({
                            status: false,
                            message: "Unable to add tag. Try again!",
                        });
                    });
            } else {
                res.status(200).json({
                    status: true,
                    message: "Tag already added!",
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: "Server side error! Try again.",
            });
        }
    },

    list_tags: async (req, res) => {
        try {
            let limit = {
                perpage: 6,
                start: 0,
            };
            if (req.bodyString("perpage") && req.bodyString("page")) {
                perpage = parseInt(req.bodyString("perpage"));
                start = parseInt(req.bodyString("page"));
                limit.perpage = perpage;
                limit.start = (start - 1) * perpage;
            }

            await helpers
                .common_select_list({}, {}, limit, "tags", {})
                .then(async (result) => {
                    let response = [];
                    for (val of result) {
                        temp = {
                            id: val?.id ? await enc_dec.encrypt(val?.id) : "",
                            tag: val?.tag ? val?.tag : "",
                            created_at: val?.created_at ? val?.created_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Tags fetched successfully!",
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

module.exports = TagController;
