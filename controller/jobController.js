require("dotenv").config();
const JobModel = require("../model/jobModel");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");
const STATIC_URL = process.env.STATIC_FILE_URL;
const moment = require("moment");

var JobController = {
    create: async (req, res) => {
        try {
            let job_no = await helpers.make_sequential_no("JOB");
            let data = {
                job_no: "JOB" + job_no,
                title: req.bodyString("title"),
                posted_by: req.user.id,
                description: req.bodyString("description"),
                category_id: enc_dec.decrypt(req.bodyString("category_id")),
                sub_category_id: enc_dec.decrypt(
                    req.bodyString("sub_category_id")
                ),
                tags: req.bodyString("tags"),
                skills: req.bodyString("skills"),
                experience: req.bodyString("experience"),
                payment_type: req.bodyString("payment_type"),
                project_budget: req.bodyString("project_budget"),
                min_pay_amount: req.bodyString("min_pay_amount"),
                max_pay_amount: req.bodyString("max_pay_amount"),
                attach_video: req.all_files?.attach_video
                    ? STATIC_URL + "jobs/" + req.all_files?.attach_video[0]
                    : "",
                attach_file: req.all_files?.attach_file
                    ? STATIC_URL + "jobs/" + req.all_files?.attach_file[0]
                    : "",
                attach_img: req.all_files?.attach_img
                    ? STATIC_URL + "jobs/" + req.all_files?.attach_img[0]
                    : "",
            };
            await JobModel.add(data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Job post added successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to post job. Try again!",
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

    update: async (req, res) => {
        let id = enc_dec.decrypt(req.bodyString("job_id"));
        try {
            const currentDatetime = moment();
            let data = {
                title: req.bodyString("title"),
                updated_by: req.user.id,
                description: req.bodyString("description"),
                category_id: enc_dec.decrypt(req.bodyString("category_id")),
                sub_category_id: enc_dec.decrypt(
                    req.bodyString("sub_category_id")
                ),
                tags: req.bodyString("tags"),
                skills: req.bodyString("skills"),
                experience: req.bodyString("experience"),
                payment_type: req.bodyString("payment_type"),
                project_budget: req.bodyString("project_budget"),
                min_pay_amount: req.bodyString("min_pay_amount"),
                max_pay_amount: req.bodyString("max_pay_amount"),
                attach_video: req.all_files?.attach_video
                    ? STATIC_URL + "jobs/" + req.all_files?.attach_video[0]
                    : "",
                attach_file: req.all_files?.attach_file
                    ? STATIC_URL + "jobs/" + req.all_files?.attach_file[0]
                    : "",
                attach_img: req.all_files?.attach_img
                    ? STATIC_URL + "jobs/" + req.all_files?.attach_img[0]
                    : "",
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };
            await JobModel.updateDetails({ id: id }, data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Job post updated successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to update job details. Try again!",
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
            let user_data = {};

            if (req.bodyString("search")) {
                search.title = req.bodyString("search");
                search.description = req.bodyString("search");
                search.job_no = req.bodyString("search");

                user_data.full_name = req.bodyString("search");
                user_data.email = req.bodyString("search");
                user_data.mobile_no = req.bodyString("search");

                let posted_by = await helpers.get_like_data(user_data, "users");

                if (posted_by.length > 0) {
                    search.posted_by = posted_by[0]?.id;
                }
            }
            if (req.bodyString("status")) {
                condition.status = req.bodyString("status");
            }
            if (req.bodyString("deleted")) {
                condition.deleted = req.bodyString("deleted");
            }
            if (req.bodyString("req_status")) {
                condition.req_status = req.bodyString("req_status");
            }
            // if (req.bodyString("experience")) {
            //     condition.experience = req.bodyString("experience");
            // }
            // if (req.bodyString("payment_type")) {
            //     condition.payment_type = req.bodyString("payment_type");
            // }
            if (req.bodyString("posted_by")) {
                condition.posted_by = enc_dec.decrypt(
                    req.bodyString("posted_by")
                );
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

            const totalCount = await JobModel.get_count(condition, {}, search);

            await JobModel.select_list(condition, {}, limit, search)
                .then(async (result) => {
                    console.log(result);

                    let response = [];
                    for (let val of result) {
                        let proposalCount = await JobModel.get_proposal_count({
                            job_id: val?.id,
                        });
                        let category_name = await helpers.get_data_list(
                            "name",
                            "categories",
                            { id: val?.category_id }
                        );
                        let userData = await helpers.get_data_list(
                            "full_name,profile_img",
                            "users",
                            { id: val?.posted_by }
                        );
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            job_no: val?.job_no ? val?.job_no : "",
                            req_status:
                                val?.req_status == 1
                                    ? "pending"
                                    : val?.req_status == 2
                                    ? "rejected"
                                    : "accepted",
                            status: val?.status == 0 ? "active" : "inactive",
                            job_no: val?.job_no ? val?.job_no : "",
                            title: val?.title ? val?.title : "",
                            description: val?.description
                                ? val?.description
                                : "",
                            category_id: val?.category_id
                                ? enc_dec.encrypt(val?.category_id)
                                : "",
                            posted_by: val?.posted_by
                                ? enc_dec.encrypt(val?.posted_by)
                                : "",
                            username: userData.length
                                ? userData[0].full_name
                                : "",
                            user_img: userData.length
                                ? userData[0].profile_img
                                : "",
                            category_name: category_name.length
                                ? category_name[0].name
                                : "",
                            sub_category_id: val?.sub_category_id
                                ? enc_dec.encrypt(val?.sub_category_id)
                                : "",
                            tags: val?.tags ? val?.tags : "",
                            // skills: val?.skills ? val?.skills : "",
                            // experience: val?.experience ? val?.experience : "",
                            // payment_type: val?.payment_type
                            //     ? val?.payment_type
                            //     : "",
                            project_budget: val?.project_budget
                                ? val?.project_budget
                                : 0,
                            // min_pay_amount: val?.in_pay_amount
                            //     ? val?.in_pay_amount
                            //     : 0,
                            // max_pay_amount: val?.max_pay_amount
                            //     ? val?.max_pay_amount
                            //     : 0,
                            attach_img: val?.attach_img ? val?.attach_img : "",
                            attach_file: val?.attach_file
                                ? val?.attach_file
                                : "",
                            attach_video: val?.attach_video
                                ? val?.attach_video
                                : "",
                            proposalCount: proposalCount || 0,
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Jobs fetched successfully!",
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
            let id = enc_dec.decrypt(req.bodyString("job_id"));
            await JobModel.select({ id: id })
                .then(async (result) => {
                    let response = [];
                    for (let val of result) {
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            title: val?.title ? val?.title : "",
                            description: val?.description
                                ? val?.description
                                : "",
                            category: val?.category ? val?.category : "",
                            tags: val?.tags ? val?.tags : "",
                            skills: val?.skills ? val?.skills : "",
                            experience: val?.experience ? val?.experience : "",
                            payment_type: val?.payment_type
                                ? val?.payment_type
                                : "",
                            project_budget: val?.project_budget
                                ? val?.project_budget
                                : 0,
                            min_pay_amount: val?.in_pay_amount
                                ? val?.in_pay_amount
                                : 0,
                            max_pay_amount: val?.max_pay_amount
                                ? val?.max_pay_amount
                                : 0,
                            project_files: val?.project_files
                                ? val?.project_files
                                : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response[0],
                        message: "Job details fetched successfully!",
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

    delete: async (req, res) => {
        try {
            let id = enc_dec.decrypt(req.bodyString("job_id"));
            let data = {
                deleted: req.bodyString("deleted"),
                updated_at: moment().format("YYYY-MM-DD HH:mm"),
            };
            await JobModel.updateDetails({ id: id }, data)
                .then(async (result) => {
                    res.status(200).json({
                        status: true,
                        message: "Job deleted successfully!",
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

    apply_v2: async (req, res) => {
        try {
            let job_id = enc_dec.decrypt(req.bodyString("job_id"));
            let client_id = await helpers.get_data_list("posted_by", "jobs", {
                id: job_id,
            });

            let data = {
                date: req.bodyString("date"),
                time: req.bodyString("time"),
                expert_id: req.user?.id,
                client_id: client_id.length ? client_id[0].posted_by : "",
                job_id: job_id,
            };
            await JobModel.apply(data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Job applied successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to apply for job. Try again!",
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

    apply: async (req, res) => {
        try {
            let files = req.all_files?.project_img;
            let filesStringified;
            if (files) {
                const filesWithStaticUrl = files.map(
                    (file) => STATIC_URL + "jobs/" + file
                );
                filesStringified = JSON.stringify(filesWithStaticUrl);
            }

            let job_id = enc_dec.decrypt(req.bodyString("job_id"));
            let client_id = await helpers.get_data_list("posted_by", "jobs", {
                id: job_id,
            });

            let data = {
                cover_letter: req.bodyString("cover_letter"),
                expert_id: req.user?.id,
                client_id: client_id.length ? client_id[0].posted_by : "",
                job_id: job_id,
                is_hourly: req.bodyString("is_hourly"),
                from_rate: req.bodyString("from_rate"),
                to_rate: req.bodyString("to_rate"),
                fix_budget: req.bodyString("fix_budget"),
                attach_file: req.all_files?.attach_file
                    ? STATIC_URL + "jobs/" + req.all_files?.attach_file[0]
                    : "",
                project_img: filesStringified,
            };
            await JobModel.apply(data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Job applied successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to apply for job. Try again!",
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

    applied_list: async (req, res) => {
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

            if (req.bodyString("req_status")) {
                condition.req_status = req.bodyString("req_status");
            }
            if (req.bodyString("is_hourly")) {
                condition.is_hourly = req.bodyString("is_hourly");
            }
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
            if (req.bodyString("job_id")) {
                condition.job_id = enc_dec.decrypt(req.bodyString("job_id"));
            }

            const totalCount = await JobModel.applied_get_count(condition, {});

            await JobModel.applied_select_list(condition, {}, limit)
                .then(async (result) => {
                    console.log(result);
                    let response = [];
                    for (let val of result) {
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            expert_id: val?.expert_id
                                ? enc_dec.encrypt(val?.expert_id)
                                : "",
                            client_id: val?.client_id
                                ? enc_dec.encrypt(val?.client_id)
                                : "",
                            job_id: val?.job_id
                                ? enc_dec.encrypt(val?.job_id)
                                : "",
                            req_status:
                                val?.req_status == 1 ? "pending" : "accepted",
                            date: val?.date ? val?.date : "",
                            time: val?.time ? val?.time : "",
                            // is_hourly: val?.is_hourly == 0 ? false : true,
                            // cover_letter: val?.cover_letter
                            //     ? val?.cover_letter
                            //     : "",
                            // fix_budget: val?.fix_budget ? val?.fix_budget : 0,
                            // from_rate: val?.from_rate ? val?.from_rate : 0,
                            // to_rate: val?.to_rate ? val?.to_rate : 0,
                            // project_img: val?.project_img
                            //     ? val?.project_img
                            //     : "",
                            // attach_file: val?.attach_file
                            //     ? val?.attach_file
                            //     : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Jobs fetched successfully!",
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

    applied_details: async (req, res) => {
        try {
            let condition = {};

            if (req.bodyString("applied_id")) {
                condition.id = enc_dec.decrypt(req.bodyString("applied_id"));
            }

            await JobModel.selectSpecific("*", condition)
                .then(async (result) => {
                    let response = [];

                    for (let val of result) {
                        let job_details = await helpers.get_data_list(
                            "*",
                            "jobs",
                            {
                                id: val?.job_id,
                            }
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
                            expert_id: val?.expert_id
                                ? enc_dec.encrypt(val?.expert_id)
                                : "",
                            client_id: val?.client_id
                                ? enc_dec.encrypt(val?.client_id)
                                : "",
                            client_info:
                                client_info.length > 0 ? client_info[0] : "",
                            expert_info:
                                expert_info.length > 0 ? expert_info[0] : "",
                            job_details: {
                                id: job_details[0].id
                                    ? enc_dec.encrypt(job_details[0].id)
                                    : "",
                                job_no: job_details[0].job_no
                                    ? job_details[0].job_no
                                    : "",
                                posted_by: job_details[0].posted_by
                                    ? enc_dec.encrypt(job_details[0].posted_by)
                                    : "",
                                updated_by: job_details[0].updated_by
                                    ? enc_dec.encrypt(job_details[0].updated_by)
                                    : "",
                                req_status:
                                    job_details[0].req_status == 1
                                        ? "pending"
                                        : job_details[0].req_status == 0
                                        ? "accepted"
                                        : "rejected",
                                status:
                                    job_details[0].status == 0
                                        ? "active"
                                        : "inactive",
                                title: job_details[0].title
                                    ? job_details[0].title
                                    : "",
                                description: job_details[0].description
                                    ? job_details[0].description
                                    : "",
                                category_id: job_details[0].category_id
                                    ? enc_dec.encrypt(
                                          job_details[0].category_id
                                      )
                                    : "",
                                sub_category_id: job_details[0].sub_category_id
                                    ? enc_dec.encrypt(
                                          job_details[0].sub_category_id
                                      )
                                    : "",
                                tags: job_details[0].tags
                                    ? job_details[0].tags
                                    : "",
                                skills: job_details[0].skills
                                    ? job_details[0].skills
                                    : "",
                                experience: job_details[0].experience
                                    ? job_details[0].experience
                                    : "",
                                payment_type: job_details[0].payment_type
                                    ? job_details[0].payment_type
                                    : "",
                                project_budget: job_details[0].project_budget
                                    ? job_details[0].project_budget
                                    : "",
                                min_pay_amount: job_details[0].min_pay_amount
                                    ? job_details[0].min_pay_amount
                                    : "",
                                max_pay_amount: job_details[0].max_pay_amount
                                    ? job_details[0].max_pay_amount
                                    : "",
                                attach_img: job_details[0].attach_img
                                    ? job_details[0].attach_img
                                    : "",
                                attach_file: job_details[0].attach_file
                                    ? job_details[0].attach_file
                                    : "",
                                attach_video: job_details[0].attach_video
                                    ? job_details[0].attach_video
                                    : "",
                                created_at: job_details[0].created_at
                                    ? job_details[0].created_at
                                    : "",
                                updated_at: job_details[0].updated_at
                                    ? job_details[0].updated_at
                                    : "",
                            },
                            job_id: val?.job_id
                                ? enc_dec.encrypt(val?.job_id)
                                : "",
                            req_status:
                                val?.req_status == 1 ? "pending" : "accepted",
                            date: val?.date ? val?.date : "",
                            time: val?.time ? val?.time : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response[0],
                        message: "Jobs applied details fetched successfully!",
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

    update_request_status: async (req, res) => {
        try {
            const currentDatetime = moment();

            const applied_id = enc_dec.decrypt(req.bodyString("applied_id"));
            const req_status = req.bodyString("req_status");

            const update_data = {
                req_status,
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };

            await JobModel.updateDetails2({ id: applied_id }, update_data);

            return res.status(200).json({
                status: true,
                message: "Request status changed successfully",
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                status: false,
                message: "Internal server error!",
            });
        }
    },
};

module.exports = JobController;
