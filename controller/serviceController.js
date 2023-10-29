require("dotenv").config();
const ServiceModel = require("../model/serviceModel");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");
const STATIC_URL = process.env.STATIC_FILE_URL;
const moment = require("moment");

var ServiceController = {
    booking: async (req, res) => {
        try {
            let data = {
                service_id: enc_dec.decrypt(req.bodyString("service_id")),
                client_id: req.user.id,
                booking_date: req.bodyString("booking_date"),
                booking_time: req.bodyString("booking_time"),
                working_hours: req.bodyString("working_hours"),
                address: req.bodyString("address"),
                location: req.bodyString("location"),
                payment_method: req.bodyString("payment_method"),
                payment_id: req.bodyString("payment_id"),
            };
            await ServiceModel.booking(data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Service booked successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to book service. Try again!",
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

    create: async (req, res) => {
        console.log("all_files =>", req.all_files);
        try {
            let files = req.all_files?.service_img;
            const filesWithStaticUrl = files.map(
                (file) => STATIC_URL + "services/" + file
            );
            const filesStringified = JSON.stringify(filesWithStaticUrl);
            console.log("filesStringified", filesStringified);

            let data = {
                posted_by: req.user.id,
                title: req.bodyString("title"),
                description: req.bodyString("description"),
                cover_video: req.all_files?.cover_video
                    ? STATIC_URL + "services/" + req.all_files?.cover_video[0]
                    : "",
                attach_file: req.all_files?.attach_file
                    ? STATIC_URL + "services/" + req.all_files?.attach_file[0]
                    : "",
                cover_img: req.all_files?.cover_img
                    ? STATIC_URL + "services/" + req.all_files?.cover_img[0]
                    : "",
                service_img: filesStringified,
                category_id: enc_dec.decrypt(req.bodyString("category_id")),
                budget: req.bodyString("budget"),
                tags: req.bodyString("tags"),
                sub_category_id: req.bodyString("sub_category_id")
                    ? enc_dec.decrypt(req.bodyString("sub_category_id"))
                    : "",
            };
            await ServiceModel.add(data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Service added successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to add service. Try again!",
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

    // update: async (req, res) => {
    //     let id = enc_dec.decrypt(req.bodyString("job_id"));
    //     try {
    //         // let files = req.all_files.project_files;
    //         // const filesWithStaticUrl = files.map(
    //         //     (file) => STATIC_URL + "jobs/" + file
    //         // );
    //         // const filesStringified = JSON.stringify(filesWithStaticUrl);
    //         const currentDatetime = moment();
    //         let data = {
    //             title: req.bodyString("title"),
    //             updated_by: req.user.id,
    //             description: req.bodyString("description"),
    //             category_id: enc_dec.decrypt(req.bodyString("category_id")),
    //             sub_category_id: enc_dec.decrypt(
    //                 req.bodyString("sub_category_id")
    //             ),
    //             tags: req.bodyString("tags"),
    //             skills: req.bodyString("skills"),
    //             experience: req.bodyString("experience"),
    //             payment_type: req.bodyString("payment_type"),
    //             project_budget: req.bodyString("project_budget"),
    //             min_pay_amount: req.bodyString("min_pay_amount"),
    //             max_pay_amount: req.bodyString("max_pay_amount"),
    //             attach_video: req.all_files?.attach_video
    //                 ? req.all_files?.attach_video[0]
    //                 : "",
    //             attach_file: req.all_files?.attach_file
    //                 ? req.all_files?.attach_file[0]
    //                 : "",
    //             attach_img: req.all_files?.attach_img
    //                 ? req.all_files?.attach_img[0]
    //                 : "",
    //             updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
    //         };
    //         await ServiceModel.updateDetails({ id: id }, data)
    //             .then((result) => {
    //                 res.status(200).json({
    //                     status: true,
    //                     message: "Job post updated successfully!",
    //                 });
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //                 res.status(500).json({
    //                     status: false,
    //                     message: "Unable to update job details. Try again!",
    //                 });
    //             });
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).json({
    //             status: false,
    //             message: "Server side error! Try again.",
    //         });
    //     }
    // },

    booking_list: async (req, res) => {
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
            // if (req.user?.type === "expert") {
            //     condition.posted_by = req.user?.id;
            // }
            // if (req.bodyString("expert_id")) {
            //     condition.posted_by = enc_dec.decrypt(
            //         req.bodyString("expert_id")
            //     );
            // }
            // if (req.bodyString("req_status")) {
            //     condition.req_status = req.bodyString("req_status");
            // }
            // if (req.bodyString("status")) {
            //     condition.status = req.bodyString("status");
            // }

            const totalCount = await ServiceModel.booking_get_count(
                condition,
                {}
            );
            console.log(totalCount);

            await ServiceModel.booking_select_list(condition, {}, limit)
                .then(async (result) => {
                    console.log(result);
                    let response = [];
                    for (let val of result) {
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            service_id: val?.service_id
                                ? enc_dec.encrypt(val?.service_id)
                                : "",
                            client_id: val?.client_id
                                ? enc_dec.encrypt(val?.client_id)
                                : "",
                            req_status:
                                val?.req_status == 1
                                    ? "pending"
                                    : val?.req_status == 2
                                    ? "rejected"
                                    : "accepted",
                            work_status:
                                val?.work_status == 2
                                    ? "not_started"
                                    : val?.work_status == 1
                                    ? "ongoing"
                                    : "completed",
                            booking_date: val?.booking_date
                                ? val?.booking_date
                                : "",
                            booking_time: val?.booking_time
                                ? val?.booking_time
                                : "",
                            working_hours: val?.working_hours
                                ? val?.working_hours
                                : "",
                            address: val?.address ? val?.address : "",
                            location: val?.location ? val?.location : "",
                            payment_method: val?.payment_method
                                ? val?.payment_method
                                : "",
                            payment_id: val?.payment_id ? val?.payment_id : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Services fetched successfully!",
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
    
    list: async (req, res) => {
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
            if (req.user?.type === "expert") {
                condition.posted_by = req.user?.id;
            }
            if (req.bodyString("expert_id")) {
                condition.posted_by = enc_dec.decrypt(
                    req.bodyString("expert_id")
                );
            }
            if (req.bodyString("req_status")) {
                condition.req_status = req.bodyString("req_status");
            }
            if (req.bodyString("status")) {
                condition.status = req.bodyString("status");
            }

            const totalCount = await ServiceModel.get_count(condition, {});
            console.log(totalCount);

            await ServiceModel.select_list(condition, {}, limit)
                .then(async (result) => {
                    let response = [];
                    for (let val of result) {
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            posted_by: val?.posted_by
                                ? enc_dec.encrypt(val?.posted_by)
                                : "",
                            req_status:
                                val?.req_status == 1
                                    ? "pending"
                                    : val?.req_status == 2
                                    ? "rejected"
                                    : "approved",
                            status: val?.status == 1 ? "inactive" : "active",
                            title: val?.title ? val?.title : "",
                            description: val?.description
                                ? val?.description
                                : "",
                            category_id: val?.category_id
                                ? enc_dec.encrypt(val?.category_id)
                                : "",
                            sub_category_id: val?.sub_category_id
                                ? enc_dec.encrypt(val?.sub_category_id)
                                : "",
                            tags: val?.tags ? val?.tags : "",
                            budget: val?.budget ? val?.budget : 0,
                            cover_img: val?.cover_img ? val?.cover_img : "",
                            attach_file: val?.attach_file
                                ? val?.attach_file
                                : "",
                            cover_video: val?.cover_video
                                ? val?.cover_video
                                : "",
                            service_img: val?.service_img
                                ? val?.service_img
                                : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Services fetched successfully!",
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

    details: async (req, res) => {
        try {
            let id = enc_dec.decrypt(req.bodyString("service_id"));
            await ServiceModel.select({ id: id })
                .then(async (result) => {
                    let response = [];
                    for (let val of result) {
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            posted_by: val?.posted_by
                                ? enc_dec.encrypt(val?.posted_by)
                                : "",
                            req_status:
                                val?.req_status == 1
                                    ? "pending"
                                    : val?.req_status == 2
                                    ? "rejected"
                                    : "approved",
                            status: val?.status == 1 ? "inactive" : "active",
                            title: val?.title ? val?.title : "",
                            description: val?.description
                                ? val?.description
                                : "",
                            category_id: val?.category_id
                                ? enc_dec.encrypt(val?.category_id)
                                : "",
                            sub_category_id: val?.sub_category_id
                                ? enc_dec.encrypt(val?.sub_category_id)
                                : "",
                            tags: val?.tags ? val?.tags : "",
                            budget: val?.budget ? val?.budget : 0,
                            cover_img: val?.cover_img ? val?.cover_img : "",
                            attach_file: val?.attach_file
                                ? val?.attach_file
                                : "",
                            cover_video: val?.cover_video
                                ? val?.cover_video
                                : "",
                            service_img: val?.service_img
                                ? val?.service_img
                                : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response[0],
                        message: "Service details fetched successfully!",
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

    request_update: async (req, res) => {
        let id = enc_dec.decrypt(req.bodyString("service_id"));
        try {
            const currentDatetime = moment();
            let data = {
                req_status: req.bodyString("req_status"),
                status: req.bodyString("req_status") == 0 ? 0 : 1,
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };
            await ServiceModel.updateDetails({ id: id }, data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Service request updated successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to update request. Try again!",
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

    delete: async (req, res) => {
        try {
            let id = enc_dec.decrypt(req.bodyString("job_id"));
            await ServiceModel.delete({ id: id })
                .then(async (result) => {
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Job deleted successfully!",
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

module.exports = ServiceController;
