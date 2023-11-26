require("dotenv").config();
const ServiceModel = require("../model/serviceModel");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");
const STATIC_URL = process.env.STATIC_FILE_URL;
const moment = require("moment");

var ServiceController = {
    booking: async (req, res) => {
        try {
            let ser_id = enc_dec.decrypt(req.bodyString("service_id"));
            let expert_id = await helpers.get_data_list(
                "posted_by",
                "services",
                {
                    id: ser_id,
                }
            );
            let data = {
                service_id: ser_id,
                client_id: req.user.id,
                expert_id: expert_id.length ? expert_id[0].posted_by : "",
                booking_date: req.bodyString("booking_date"),
                booking_time: req.bodyString("booking_time"),
                working_hours: req.bodyString("working_hours"),
                address: req.bodyString("address"),
                location: req.bodyString("location"),
                payment_method: req.bodyString("payment_method"),
                payment_id: req.bodyString("payment_id"),
            };
            await ServiceModel.add_v2(data, "bookings")
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

    rescheduled: async (req, res) => {
        try {
            let id = enc_dec.decrypt(req.bodyString("booking_id"));
            let update_data = {
                booking_date: req.bodyString("booking_date"),
                booking_time: req.bodyString("booking_time"),
                working_hours: req.bodyString("working_hours"),
                address: req.bodyString("address"),
                location: req.bodyString("location"),
                rescheduled: 1,
                payment_method: req.bodyString("payment_method"),
                payment_id: req.bodyString("payment_id"),
                updated_at: moment().format("YYYY-MM-DD HH:mm"),
            };
            await ServiceModel.updateDetailsV2(
                { id: id },
                update_data,
                "bookings"
            )
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Service rescheduled successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to reschedule. Try again!",
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
        try {
            let service_no = await helpers.make_sequential_no("SRV");
            let files = req.all_files?.service_img;
            if (!files) {
                return res.status(500).json({
                    status: false,
                    message: "Unable to add service without files. Try again!",
                });
            }
            const filesWithStaticUrl = files.map(
                (file) => STATIC_URL + "services/" + file
            );
            const filesStringified = JSON.stringify(filesWithStaticUrl);
            console.log("filesStringified", filesStringified);

            let data = {
                service_no: "SRV" + service_no,
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
            let search = {};
            if (req.bodyString("client_id")) {
                condition.client_id = enc_dec.decrypt(
                    req.bodyString("client_id")
                );
            }
            if (req.bodyString("expert_id")) {
                condition.expert_id = enc_dec.decrypt(
                    req.bodyString("expert_id")
                );
            }
            if (req.bodyString("service_id")) {
                condition.service_id = enc_dec.decrypt(
                    req.bodyString("service_id")
                );
            }
            if (req.bodyString("req_status")) {
                condition.req_status = req.bodyString("req_status");
            }
            if (req.bodyString("status")) {
                condition.status = req.bodyString("status");
            }
            if (req.bodyString("payment_method")) {
                condition.payment_method = req.bodyString("payment_method");
            }
            if (req.bodyString("work_status")) {
                condition.work_status = req.bodyString("work_status");
            }
            if (req.bodyString("cancelled")) {
                condition.cancelled = req.bodyString("cancelled");
            }
            if (req.bodyString("deleted")) {
                condition.deleted = req.bodyString("deleted");
            }
            if (req.bodyString("rescheduled")) {
                condition.rescheduled = req.bodyString("rescheduled");
            }

            if (req.bodyString("search")) {
                search.title = req.bodyString("search");
            }

            const totalCount = await ServiceModel.booking_get_count(
                condition,
                {},
                search
            );

            await ServiceModel.booking_select_list(condition, {}, limit, search)
                .then(async (result) => {
                    console.log(result);
                    let response = [];
                    for (let val of result) {
                        let service_details = await helpers.get_data_list(
                            "*",
                            "services",
                            { id: val?.service_id }
                        );
                        let client_name = await helpers.get_data_list(
                            "full_name",
                            "users",
                            { id: val?.client_id }
                        );
                        let expert_name = await helpers.get_data_list(
                            "full_name",
                            "users",
                            { id: val?.expert_id }
                        );
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            service_id: val?.service_id
                                ? enc_dec.encrypt(val?.service_id)
                                : "",
                            service_details: service_details && {
                                posted_by: service_details[0]?.posted_by
                                    ? enc_dec.encrypt(
                                          service_details[0]?.posted_by
                                      )
                                    : "",
                                title: service_details[0]?.title
                                    ? service_details[0]?.title
                                    : "",
                                description: service_details[0]?.description
                                    ? service_details[0]?.description
                                    : "",
                                category_id: service_details[0]?.category_id
                                    ? enc_dec.encrypt(
                                          service_details[0]?.category_id
                                      )
                                    : "",
                                sub_category_id: service_details[0]
                                    ?.sub_category_id
                                    ? enc_dec.encrypt(
                                          service_details[0]?.sub_category_id
                                      )
                                    : "",
                                tags: service_details[0]?.tags
                                    ? service_details[0]?.tags
                                    : "",
                                budget: service_details[0]?.budget
                                    ? service_details[0]?.budget
                                    : 0,
                                cover_img: service_details[0]?.cover_img
                                    ? service_details[0]?.cover_img
                                    : "",
                                attach_file: service_details[0]?.attach_file
                                    ? service_details[0]?.attach_file
                                    : "",
                                cover_video: service_details[0]?.cover_video
                                    ? service_details[0]?.cover_video
                                    : "",
                                service_img: service_details[0]?.service_img
                                    ? service_details[0]?.service_img
                                    : "",
                                created_at: service_details[0]?.created_at
                                    ? service_details[0]?.created_at
                                    : "",
                                updated_at: service_details[0]?.updated_at
                                    ? service_details[0]?.updated_at
                                    : "",
                            },
                            client_id: val?.client_id
                                ? enc_dec.encrypt(val?.client_id)
                                : "",
                            client_name:
                                client_name.length > 0
                                    ? client_name[0].full_name
                                    : "",
                            expert_name:
                                expert_name.length > 0
                                    ? expert_name[0].full_name
                                    : "",
                            expert_id: val?.expert_id
                                ? enc_dec.encrypt(val?.expert_id)
                                : "",
                            payment_status:
                                val?.payment_status == 1 ? "paid" : "unpaid",
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

    booking_details: async (req, res) => {
        try {
            let condition = {};

            if (req.bodyString("booking_id")) {
                condition.id = enc_dec.decrypt(req.bodyString("booking_id"));
            }

            await ServiceModel.selectSpecific("*", condition)
                .then(async (result) => {
                    console.log(result);
                    let response = [];
                    for (let val of result) {
                        let service_details = await helpers.get_data_list(
                            "*",
                            "services",
                            { id: val?.service_id }
                        );
                        let client_info = await helpers.get_data_list(
                            "full_name,mobile_no,address",
                            "users",
                            { id: val?.client_id }
                        );
                        let expert_info = await helpers.get_data_list(
                            "full_name,mobile_no,address",
                            "users",
                            { id: val?.expert_id }
                        );
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            service_id: val?.service_id
                                ? enc_dec.encrypt(val?.service_id)
                                : "",
                            service_details: service_details && {
                                posted_by: service_details[0]?.posted_by
                                    ? enc_dec.encrypt(
                                          service_details[0]?.posted_by
                                      )
                                    : "",
                                title: service_details[0]?.title
                                    ? service_details[0]?.title
                                    : "",
                                description: service_details[0]?.description
                                    ? service_details[0]?.description
                                    : "",
                                category_id: service_details[0]?.category_id
                                    ? enc_dec.encrypt(
                                          service_details[0]?.category_id
                                      )
                                    : "",
                                sub_category_id: service_details[0]
                                    ?.sub_category_id
                                    ? enc_dec.encrypt(
                                          service_details[0]?.sub_category_id
                                      )
                                    : "",
                                tags: service_details[0]?.tags
                                    ? service_details[0]?.tags
                                    : "",
                                budget: service_details[0]?.budget
                                    ? service_details[0]?.budget
                                    : 0,
                                cover_img: service_details[0]?.cover_img
                                    ? service_details[0]?.cover_img
                                    : "",
                                attach_file: service_details[0]?.attach_file
                                    ? service_details[0]?.attach_file
                                    : "",
                                cover_video: service_details[0]?.cover_video
                                    ? service_details[0]?.cover_video
                                    : "",
                                service_img: service_details[0]?.service_img
                                    ? service_details[0]?.service_img
                                    : "",
                                created_at: service_details[0]?.created_at
                                    ? service_details[0]?.created_at
                                    : "",
                                updated_at: service_details[0]?.updated_at
                                    ? service_details[0]?.updated_at
                                    : "",
                            },
                            client_id: val?.client_id
                                ? enc_dec.encrypt(val?.client_id)
                                : "",
                            client_info:
                                client_info.length > 0 ? client_info[0] : "",
                            expert_info:
                                expert_info.length > 0 ? expert_info[0] : "",
                            expert_id: val?.expert_id
                                ? enc_dec.encrypt(val?.expert_id)
                                : "",
                            payment_status:
                                val?.payment_status == 1 ? "paid" : "unpaid",
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
                        data: response[0],
                        message: "Services details successfully!",
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
            let search = {};
            if (req.bodyString("search")) {
                search.service_no = req.bodyString("search");
                search.title = req.bodyString("search");
                search.description = req.bodyString("search");
            }
            if (req.user?.type === "expert") {
                condition.posted_by = req.user?.id;
            }
            if (req.bodyString("posted_by")) {
                condition.posted_by = enc_dec.decrypt(
                    req.bodyString("posted_by")
                );
            }
            if (req.bodyString("req_status")) {
                condition.req_status = req.bodyString("req_status");
            }
            if (req.bodyString("status")) {
                condition.status = req.bodyString("status");
            }
            if (req.bodyString("deleted")) {
                condition.deleted = req.bodyString("deleted");
            }
            if (req.bodyString("category_id")) {
                condition.category_id = enc_dec.decrypt(
                    req.bodyString("category_id")
                );
            }
            if (req.bodyString("sub_category_id")) {
                condition.sub_category_id = enc_dec.decrypt(
                    req.bodyString("sub_category_id")
                );
            }

            const totalCount = await ServiceModel.get_count(
                condition,
                {},
                search
            );
            // console.log(totalCount);

            await ServiceModel.select_list(condition, {}, limit, search)
                .then(async (result) => {
                    let response = [];

                    for (let val of result) {
                        let user_name = await helpers.get_data_list(
                            "full_name",
                            "users",
                            { id: val?.posted_by }
                        );
                        let ctg_name = await helpers.get_data_list(
                            "name",
                            "categories",
                            { id: val?.category_id }
                        );

                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            service_no: val?.service_no ? val?.service_no : "",
                            posted_by: val?.posted_by
                                ? enc_dec.encrypt(val?.posted_by)
                                : "",
                            expert_name:
                                user_name.length > 0
                                    ? user_name[0]?.full_name
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
                            category_name:
                                ctg_name.length > 0 ? ctg_name[0].name : "",
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

    booking_status: async (req, res) => {
        let id = enc_dec.decrypt(req.bodyString("booking_id"));
        try {
            const currentDatetime = moment();
            let data = {
                req_status: req.bodyString("req_status"),
                work_status: req.bodyString("req_status") == 0 ? 1 : 2,
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };
            await ServiceModel.updateDetailsV2({ id: id }, data, "bookings")
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Booking request updated successfully!",
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

    work_status: async (req, res) => {
        let id = enc_dec.decrypt(req.bodyString("booking_id"));
        try {
            const currentDatetime = moment();
            let data = {
                work_status: req.bodyString("work_status"),
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };
            await ServiceModel.updateDetailsV2({ id: id }, data, "bookings")
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Booking status updated successfully!",
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
            let id = enc_dec.decrypt(req.bodyString("service_id"));
            let data = {
                deleted: req.bodyString("deleted"),
                updated_at: moment().format("YYYY-MM-DD HH:mm"),
            };
            await ServiceModel.updateDetails({ id: id }, data)
                .then(async (result) => {
                    res.status(200).json({
                        status: true,
                        message: "Service deleted successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        error: "Server side error!",
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                error: "Server side error!",
            });
        }
    },

    cancel_booking: async (req, res) => {
        try {
            const bookingId = enc_dec.decrypt(req.bodyString("booking_id"));

            // Prepare data for cancelled bookings
            const cancel_data = {
                cancelled_by: req.user.id,
                booking_id: bookingId,
                reason: req.bodyString("reason"),
                comment: req.bodyString("comment"),
            };

            // Prepare data for updating booking details
            const update_data = {
                cancelled: 1,
                updated_at: moment().format("YYYY-MM-DD HH:mm"),
            };

            // Add cancelled booking data
            await ServiceModel.add_v2(cancel_data, "cancelled_bookings");

            // Update booking details
            await ServiceModel.updateDetailsV2(
                { id: bookingId },
                update_data,
                "bookings"
            );

            res.status(200).json({
                status: true,
                message: "Booking cancelled successfully!",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: false,
                error: "Server side error!",
            });
        }
    },
};

module.exports = ServiceController;
