require("dotenv").config();
const JobModel = require("../model/jobModel");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");
const STATIC_URL = process.env.STATIC_FILE_URL;
const moment = require("moment");

var JobController = {
    create: async (req, res) => {
        console.log("all_files =>", req.all_files);
        try {
            // let files = req.all_files.project_files;
            // const filesWithStaticUrl = files.map(
            //     (file) => STATIC_URL + "jobs/" + file
            // );
            // const filesStringified = JSON.stringify(filesWithStaticUrl);
            // console.log(filesStringified);

            let data = {
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
                    ? req.all_files?.attach_video[0]
                    : "",
                attach_file: req.all_files?.attach_file
                    ? req.all_files?.attach_file[0]
                    : "",
                attach_img: req.all_files?.attach_img
                    ? req.all_files?.attach_img[0]
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
            console.log("filesStringified", filesStringified);
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

    update: async (req, res) => {
        let id = enc_dec.decrypt(req.bodyString("job_id"));
        try {
            // let files = req.all_files.project_files;
            // const filesWithStaticUrl = files.map(
            //     (file) => STATIC_URL + "jobs/" + file
            // );
            // const filesStringified = JSON.stringify(filesWithStaticUrl);
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
                    ? req.all_files?.attach_video[0]
                    : "",
                attach_file: req.all_files?.attach_file
                    ? req.all_files?.attach_file[0]
                    : "",
                attach_img: req.all_files?.attach_img
                    ? req.all_files?.attach_img[0]
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

            if (req.bodyString("status")) {
                condition.status = req.bodyString("status");
            }
            if (req.bodyString("req_status")) {
                condition.req_status = req.bodyString("req_status");
            }
            if (req.bodyString("experience")) {
                condition.experience = req.bodyString("experience");
            }
            if (req.bodyString("payment_type")) {
                condition.payment_type = req.bodyString("payment_type");
            }
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

            const totalCount = await JobModel.get_count(condition, {});

            await JobModel.select_list(condition, {}, limit)
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
                            req_status:
                                val?.req_status == 1
                                    ? "pending"
                                    : val?.req_status == 2
                                    ? "rejected"
                                    : "accepted",
                            status: val?.status == 0 ? "active" : "inactive",
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
            console.log(totalCount);

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
                            is_hourly: val?.is_hourly == 0 ? false : true,
                            cover_letter: val?.cover_letter
                                ? val?.cover_letter
                                : "",
                            fix_budget: val?.fix_budget ? val?.fix_budget : 0,
                            from_rate: val?.from_rate ? val?.from_rate : 0,
                            to_rate: val?.to_rate ? val?.to_rate : 0,
                            project_img: val?.project_img
                                ? val?.project_img
                                : "",
                            attach_file: val?.attach_file
                                ? val?.attach_file
                                : "",
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
            await JobModel.delete({ id: id })
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

module.exports = JobController;
