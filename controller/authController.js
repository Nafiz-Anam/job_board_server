require("dotenv").config();
const UserModel = require("../model/userModel");
const CustomerModel = require("../model/customers");
const accessToken = require("../utilities/tokenmanager/token");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");
const otpSender = require("../utilities/sms/sentotp");
const SequenceUUID = require("sequential-uuid");
const moment = require("moment");
const email_service = require("../utilities/mail/emailService");
let static_url = process.env.STATIC_FILE_URL;

var AuthController = {
    login_v2: async (req, res) => {
        try {
            const { user_id, password } = req.body;
            let email = "";
            let mobile_no = "";
            let user_data = {};

            // Regular expression pattern for email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (emailRegex.test(user_id)) {
                email = user_id;
                user_data.email = email;
            } else {
                mobile_no = user_id;
                user_data.mobile_no = mobile_no;
            }

            const check_user_exist = await helpers.get_data_list(
                "*",
                "users",
                user_data
            );

            if (check_user_exist.length === 0) {
                return res.status(500).json({
                    status: false,
                    message: "User not found!",
                });
            }

            const plain_pass = enc_dec.decrypt(check_user_exist[0].password);

            if (plain_pass !== password) {
                return res.status(500).json({
                    status: false,
                    message: "Wrong password!",
                });
            }

            const payload = {
                id: check_user_exist[0].id,
                type: check_user_exist[0].type,
            };
            const token = accessToken(payload);

            // Save user login info
            const loginInfo = await helpers.getUserLoginInfo(req);
            await helpers.saveUserLoginInfo(check_user_exist[0]?.id, loginInfo);

            return res.status(200).json({
                status: true,
                token,
                type: check_user_exist[0].type,
                message: "User login successfully!",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "Internal server error!",
            });
        }
    },

    send_otp: async (req, res) => {
        const { mobile_code, mobile_no } = req.body;
        try {
            let otp = await helpers.generateOtp(6);
            const title = "Mr. Xpert";
            const mobile_number = `${mobile_code}${mobile_no}`;

            const welcomeMessage =
                "Welcome to " +
                title +
                "! Your verification code is: " +
                otp +
                ". Do not share it with anyone.";

            console.log("mobile_number", mobile_number);
            console.log("welcomeMessage", welcomeMessage);

            await otpSender(mobile_number, welcomeMessage)
                .then(async (data) => {
                    // console.log("sms res =>", data);
                    const uuid = new SequenceUUID({
                        valid: true,
                        dashes: true,
                        unsafeBuffer: true,
                    });

                    let token = uuid.generate();
                    let ins_data = {
                        mobile_code: mobile_code,
                        mobile_no: mobile_no,
                        otp: otp,
                        token: token,
                        sms_id: data,
                    };
                    CustomerModel.addMobileOTP(ins_data)
                        .then(async (result) => {
                            res.status(200).json({
                                status: true,
                                token: token,
                                message: "Otp sent on your mobile number",
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(500).json({
                                status: false,
                                message: error.message,
                            });
                        });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).json({
                        status: false,
                        message: error.message,
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    },

    test_send_otp: async (req, res) => {
        const { mobile_code, mobile_no } = req.body;
        try {
            let otp = await helpers.generateOtp(6);
            const title = "Mr. Xpert";
            const mobile_number = `${mobile_code}${mobile_no}`;

            const welcomeMessage =
                "Welcome to " +
                title +
                "! Your verification code is: " +
                otp +
                ". Do not share it with anyone.";

            console.log("mobile_number", mobile_number);
            console.log("welcomeMessage", welcomeMessage);

            // console.log("sms res =>", data);
            const uuid = new SequenceUUID({
                valid: true,
                dashes: true,
                unsafeBuffer: true,
            });

            let token = uuid.generate();
            let ins_data = {
                mobile_code: mobile_code,
                mobile_no: mobile_no,
                otp: otp,
                token: token,
            };
            CustomerModel.addMobileOTP(ins_data)
                .then(async (result) => {
                    res.status(200).json({
                        status: true,
                        token: token,
                        otp: welcomeMessage,
                        message: "Otp sent on your mobile number",
                    });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).json({
                        status: false,
                        message: error.message,
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    },

    resend_otp: async (req, res) => {
        const { mobile_code, mobile_no } = req.body;

        try {
            const otp = await helpers.generateOtp(6);
            const title = "Mr. Xpert";
            const mobile_number = `${mobile_code}${mobile_no}`;
            const welcomeMessage = `Welcome to ${title}! Your verification code is: ${otp}. Do not share it with anyone.`;

            const data = await otpSender(mobile_number, welcomeMessage);

            const condition = {
                mobile_code: mobile_code,
                mobile_no: mobile_no,
            };

            await helpers.delete_common_entry(condition, "otps");

            const uuid = new SequenceUUID({
                valid: true,
                dashes: true,
                unsafeBuffer: true,
            });
            const token = uuid.generate();

            const ins_data = {
                mobile_code: mobile_code,
                mobile_no: mobile_no,
                otp: otp,
                token: token,
            };

            const result = await CustomerModel.addMobileOTP(ins_data);

            res.status(200).json({
                status: true,
                token: token,
                message: "Otp sent on your mobile number",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    },

    otp_verify_v2: async (req, res) => {
        try {
            const otp = req.bodyString("otp");
            const otpToken = req.bodyString("otp_token");

            const result = await CustomerModel.selectMobileOtpData({
                otp,
                token: otpToken,
            });

            if (result) {
                const mobile_no = result.mobile_code + result.mobile_no;
                let user_no = await helpers.make_sequential_no("USR");
                let referral_code = await helpers.make_sequential_no(
                    "MREXPERT"
                );

                const userData = {
                    mobile_no,
                    user_no: "USR" + user_no,
                    referral_code: "MREXPERT" + referral_code,
                    referred_by: req.bodyString("referral_code"),
                };
                const insertionResult = await UserModel.add(userData, "users");

                if (insertionResult.insert_id) {
                    const payload = {
                        id: insertionResult?.insert_id,
                        type: "client",
                    };
                    const token = accessToken(payload);

                    await helpers.delete_common_entry(
                        { otp, token: otpToken },
                        "otps"
                    );

                    return res.status(200).json({
                        status: true,
                        token,
                        message: "OTP verified. User created successfully!",
                    });
                } else {
                    return res.status(500).json({
                        status: false,
                        message: "Error creating user.",
                    });
                }
            } else {
                return res.status(500).json({
                    status: false,
                    message: "Wrong OTP, Try again!",
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "Internal server error!",
            });
        }
    },

    add_password_v2: async (req, res) => {
        try {
            const { password } = req.body;
            const hashPassword = enc_dec.encrypt(password);

            const user_data = { password: hashPassword };
            const condition = { id: req.user?.id };

            await UserModel.updateDetails(condition, user_data, "users");

            const payload = { id: req.user?.id, type: req.user?.type };
            const token = accessToken(payload);

            return res.status(200).json({
                status: true,
                token,
                message: "User password added successfully!",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "Server side error!",
            });
        }
    },

    check_user: async (req, res) => {
        try {
            const mobile_no = req.bodyString("mobile_no");
            const email = req.bodyString("email");

            if (!mobile_no && !email) {
                return res.status(400).json({
                    status: false,
                    error: "Please provide either mobile number or email!",
                });
            }

            const check_mobile_exist = await helpers.checkExistence(
                "users",
                "mobile_no",
                mobile_no
            );
            const check_email_exist = await helpers.checkExistence(
                "users",
                "email",
                email
            );

            if (check_mobile_exist || check_email_exist) {
                return res.status(200).json({
                    status: true,
                    error: check_mobile_exist || check_email_exist,
                });
            } else {
                return res.status(500).json({
                    status: false,
                    error: `No user found with ${
                        mobile_no ? "this mobile number" : "this email address"
                    }!`,
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: false,
                error: "Server side error!",
            });
        }
    },

    password_send_otp_v2: async (req, res) => {
        const { mobile_code, mobile_no, email, type } = req.body;

        try {
            const otp = await helpers.generateOtp(6);

            const message = `Your verification code is: ${otp}. Do not share it with anyone.`;

            let target, sender;

            if (type === "mobile") {
                target = `${mobile_code}${mobile_no}`;
                sender = otpSender;
            } else if (type === "email") {
                target = email;
                sender = email_service;
            } else {
                throw new Error(
                    "Invalid 'type' provided. Use 'mobile' or 'email'."
                );
            }

            sender(target, message)
                .then(async (data) => {
                    const uuid = new SequenceUUID({
                        valid: true,
                        dashes: true,
                        unsafeBuffer: true,
                    });

                    const token = uuid.generate();
                    const ins_data = {
                        [type === "mobile" ? "mobile_code" : "email"]:
                            type === "mobile" ? mobile_code : email,
                        [type === "mobile" ? "mobile_no" : "otp"]:
                            type === "mobile" ? mobile_no : otp,
                        token: token,
                    };

                    await CustomerModel.addMobileOTP(ins_data);

                    res.status(200).json({
                        status: true,
                        token: token,
                        message: `OTP sent to ${
                            type === "mobile"
                                ? "your mobile number"
                                : "your email"
                        }`,
                    });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).json({
                        status: false,
                        message: error.message,
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    },

    password_send_otp: async (req, res) => {
        const { mobile_code, mobile_no, email, type } = req.body;
        try {
            let otp = await helpers.generateOtp(6);
            const mobile_number = `${mobile_code}${mobile_no}`;
            const welcomeMessage =
                "Your verification code is: " +
                otp +
                ". Do not share it with anyone.";

            if (type == "mobile") {
                await otpSender(mobile_number, welcomeMessage)
                    .then(async (data) => {
                        // console.log("sms res =>", data);
                        const uuid = new SequenceUUID({
                            valid: true,
                            dashes: true,
                            unsafeBuffer: true,
                        });

                        let token = uuid.generate();
                        let ins_data = {
                            mobile_code: mobile_code,
                            mobile_no: mobile_no,
                            otp: otp,
                            token: token,
                        };
                        CustomerModel.addMobileOTP(ins_data)
                            .then(async (result) => {
                                res.status(200).json({
                                    status: true,
                                    token: token,
                                    message: "Otp sent on your mobile number",
                                });
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(500).json({
                                    status: false,
                                    message: error.message,
                                });
                            });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500).json({
                            status: false,
                            message: error.message,
                        });
                    });
            } else {
                await email_service(email, welcomeMessage)
                    .then(async (data) => {
                        // console.log("sms res =>", data);
                        const uuid = new SequenceUUID({
                            valid: true,
                            dashes: true,
                            unsafeBuffer: true,
                        });

                        let token = uuid.generate();
                        let ins_data = {
                            email: email,
                            otp: otp,
                            token: token,
                        };
                        CustomerModel.addMobileOTP(ins_data)
                            .then(async (result) => {
                                res.status(200).json({
                                    status: true,
                                    token: token,
                                    message: "Otp sent on your mobile number",
                                });
                            })
                            .catch((error) => {
                                console.log(error);
                                res.status(500).json({
                                    status: false,
                                    message: error.message,
                                });
                            });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500).json({
                            status: false,
                            message: error.message,
                        });
                    });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    },

    test_password_send_otp: async (req, res) => {
        const { mobile_code, mobile_no } = req.body;
        try {
            let otp = await helpers.generateOtp(6);
            const mobile_number = `${mobile_code}${mobile_no}`;

            const welcomeMessage =
                "Your verification code is: " +
                otp +
                ". Do not share it with anyone.";

            console.log("mobile_number", mobile_number);
            console.log("welcomeMessage", welcomeMessage);

            // console.log("sms res =>", data);
            const uuid = new SequenceUUID({
                valid: true,
                dashes: true,
                unsafeBuffer: true,
            });

            let token = uuid.generate();
            let ins_data = {
                mobile_code: mobile_code,
                mobile_no: mobile_no,
                otp: otp,
                token: token,
            };
            CustomerModel.addMobileOTP(ins_data)
                .then(async (result) => {
                    res.status(200).json({
                        status: true,
                        token: token,
                        otp: welcomeMessage,
                        message: "Otp sent on your mobile number",
                    });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).json({
                        status: false,
                        message: error.message,
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    },

    password_otp_verify: async (req, res) => {
        try {
            const condition = {
                otp: req.bodyString("otp"),
                token: req.bodyString("otp_token"),
            };

            const result = await CustomerModel.selectMobileOtpData(condition);

            if (!result) {
                return res.status(500).json({
                    status: false,
                    message: "Wrong OTP, Try again!",
                });
            }

            let user_data = {};
            if (result?.email) {
                user_data.email = result.email;
            }
            if (result?.mobile_no) {
                user_data.mobile_no = result.code + result.mobile_no;
            }

            const table = "users";

            const resultUser = await UserModel.select(user_data, table);

            if (resultUser.length) {
                // jwt token
                const payload = {
                    id: resultUser[0].id,
                    type: resultUser[0].type,
                };
                const token = accessToken(payload);

                // delete OTP entry from table
                await helpers.delete_common_entry(condition, "otps");

                return res.status(200).json({
                    status: true,
                    token: token,
                    message: "OTP verified.",
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: "User not found!",
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "Internal server error!",
            });
        }
    },

    update_profile_v2: async (req, res) => {
        try {
            const currentDatetime = moment();

            const user_data = {
                full_name: req.bodyString("full_name"),
                email: req.bodyString("email"),
                mobile_no: req.bodyString("mobile_no"),
                gender: req.bodyString("gender"),
                birth_date: req.bodyString("birth_date"),
                address: req.bodyString("address"),
                profile_img:
                    static_url + "profile/" + req.all_files?.profile_img,
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };

            const condition = { id: req.user.id, type: req.user.type };

            await UserModel.updateDetails(condition, user_data, "users");

            return res.status(200).json({
                status: true,
                message: "Profile updated successfully!",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: "Internal server error!",
            });
        }
    },

    update_location: async (req, res) => {
        try {
            const currentDatetime = moment();

            const user_data = {
                location: req.bodyString("location"),
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };

            const condition = { id: req.user.id, type: req.user.type };

            await UserModel.updateDetails(condition, user_data, "users");

            console.log("Profile location updated successfully!");

            return res.status(200).json({
                status: true,
                message: "Profile location updated successfully!",
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                status: false,
                message: "Internal server error!",
            });
        }
    },

    become_expert_request: async (req, res) => {
        try {
            const currentDatetime = moment();

            const user_data = {
                expert_request: 1,
                category_id: enc_dec.decrypt(req.bodyString("category_id")),
                sub_category_id: enc_dec.decrypt(
                    req.bodyString("sub_category_id")
                ),
                full_name: req.bodyString("full_name"),
                email: req.bodyString("email"),
                mobile_no: req.bodyString("mobile_no"),
                gender: req.bodyString("gender"),
                birth_date: req.bodyString("birth_date"),
                house: req.bodyString("house"),
                street: req.bodyString("street"),
                zip: req.bodyString("zip"),
                city: req.bodyString("city"),
                state: req.bodyString("state"),
                id_type: req.bodyString("id_type"),
                id_img1: static_url + "profile/" + req.all_files?.id_img1,
                id_img2: static_url + "profile/" + req.all_files?.id_img2,
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };

            await UserModel.updateDetails(
                { id: req.user.id, type: "client" },
                user_data,
                "users"
            );

            return res.status(200).json({
                status: true,
                message: "Expert request submitted successfully",
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                status: false,
                message: "Internal server error!",
            });
        }
    },

    expert_request_list: async (req, res) => {
        try {
            let limit = {
                perpage: 10,
                start: 0,
            };

            if (req.bodyString("perpage") && req.bodyString("page")) {
                let perpage = parseInt(req.bodyString("perpage"));
                let start = parseInt(req.bodyString("page"));
                limit.perpage = perpage;
                limit.start = (start - 1) * perpage;
            }

            let condition = { expert_request: 1 };

            if (req.bodyString("status")) {
                condition.status = req.bodyString("status");
            }
            if (req.bodyString("expert_request")) {
                condition.expert_request = req.bodyString("expert_request");
            }
            if (req.bodyString("gender")) {
                condition.gender = req.bodyString("gender");
            }
            if (req.bodyString("city")) {
                condition.city = req.bodyString("city");
            }
            if (req.bodyString("state")) {
                condition.state = req.bodyString("state");
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

            const totalCount = await UserModel.get_count(
                condition,
                {},
                "users",
                {}
            );

            const result = await UserModel.select_list(
                condition,
                {},
                limit,
                "users",
                {}
            );

            let response = await Promise.all(
                result.map(async (val) => {
                    let category_name = await helpers.get_data_list(
                        "name",
                        "categories",
                        { id: val?.category_id }
                    );
                    let sub_category_name = await helpers.get_data_list(
                        "name",
                        "sub_categories",
                        { id: val?.sub_category_id }
                    );

                    return {
                        id: val?.id ? enc_dec.encrypt(val?.id) : "",
                        category_id: val?.category_id
                            ? enc_dec.encrypt(val?.category_id)
                            : "",
                        category_name: category_name.length
                            ? category_name[0].name
                            : "",
                        sub_category_id: val?.sub_category_id
                            ? enc_dec.encrypt(val?.sub_category_id)
                            : "",
                        sub_category_name: sub_category_name.length
                            ? sub_category_name[0].name
                            : "",
                        type: val?.type ? val?.type : "",
                        full_name: val?.full_name ? val?.full_name : "",
                        email: val?.email ? val?.email : "",
                        gender: val?.gender ? val?.gender : "",
                        mobile_no: val?.mobile_no ? val?.mobile_no : "",
                        birth_date: val?.birth_date ? val?.birth_date : "",
                        address: val?.address ? val?.address : "",
                        location: val?.location ? val?.location : "",
                        profile_img: val?.profile_img ? val?.profile_img : "",
                        expert_request:
                            val?.expert_request == 1
                                ? "pending"
                                : val?.expert_request == 2
                                ? "reject"
                                : "accepted",
                        status: val?.status == 0 ? "active" : "blocked",
                        house: val?.house ? val?.house : "",
                        street: val?.street ? val?.street : "",
                        zip: val?.zip ? val?.zip : "",
                        city: val?.city ? val?.city : "",
                        state: val?.state ? val?.state : "",
                        id_type: val?.id_type ? val?.id_type : "",
                        id_img1: val?.id_img1 ? val?.id_img1 : "",
                        id_img2: val?.id_img2 ? val?.id_img2 : "",
                        created_at: val?.created_at ? val?.created_at : "",
                        updated_at: val?.updated_at ? val?.updated_at : "",
                    };
                })
            );

            res.status(200).json({
                status: true,
                data: response,
                message: "Expert request list fetched successfully!",
                total: totalCount,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: false,
                data: {},
                error: "Server side error!",
            });
        }
    },

    expert_request_details: async (req, res) => {
        try {
            let id = enc_dec.decrypt(req.bodyString("req_id"));
            let condition = { id: id };

            const result = await UserModel.selectSpecific("*", condition);

            let response = await Promise.all(
                result.map(async (val) => {
                    let category_name = await helpers.get_data_list(
                        "name",
                        "categories",
                        { id: val?.category_id }
                    );
                    let sub_category_name = await helpers.get_data_list(
                        "name",
                        "sub_categories",
                        { id: val?.sub_category_id }
                    );

                    return {
                        id: val?.id ? enc_dec.encrypt(val?.id) : "",
                        category_id: val?.category_id
                            ? enc_dec.encrypt(val?.category_id)
                            : "",
                        category_name: category_name.length
                            ? category_name[0].name
                            : "",
                        sub_category_id: val?.sub_category_id
                            ? enc_dec.encrypt(val?.sub_category_id)
                            : "",
                        sub_category_name: sub_category_name.length
                            ? sub_category_name[0].name
                            : "",
                        type: val?.type ? val?.type : "",
                        full_name: val?.full_name ? val?.full_name : "",
                        email: val?.email ? val?.email : "",
                        gender: val?.gender ? val?.gender : "",
                        mobile_no: val?.mobile_no ? val?.mobile_no : "",
                        birth_date: val?.birth_date ? val?.birth_date : "",
                        address: val?.address ? val?.address : "",
                        location: val?.location ? val?.location : "",
                        profile_img: val?.profile_img ? val?.profile_img : "",
                        expert_request:
                            val?.expert_request == 1
                                ? "pending"
                                : val?.expert_request == 2
                                ? "reject"
                                : "approve",
                        house: val?.house ? val?.house : "",
                        street: val?.street ? val?.street : "",
                        zip: val?.zip ? val?.zip : "",
                        city: val?.city ? val?.city : "",
                        state: val?.state ? val?.state : "",
                        id_type: val?.id_type ? val?.id_type : "",
                        id_img1: val?.id_img1 ? val?.id_img1 : "",
                        id_img2: val?.id_img2 ? val?.id_img2 : "",
                        created_at: val?.created_at ? val?.created_at : "",
                        updated_at: val?.updated_at ? val?.updated_at : "",
                    };
                })
            );

            res.status(200).json({
                status: true,
                data: response[0],
                message: "Expert request details fetched successfully!",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: false,
                data: {},
                error: "Server side error!",
            });
        }
    },

    update_expert_request: async (req, res) => {
        try {
            const currentDatetime = moment();

            const user_id = enc_dec.decrypt(req.bodyString("user_id"));
            const expert_request = req.bodyString("status");

            const user_data = {
                expert_request,
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };

            if (expert_request == 0) {
                user_data.type = "expert";
            }

            await UserModel.updateDetails(
                { id: user_id, type: "client" },
                user_data,
                "users"
            );

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

    profile_details: async (req, res) => {
        try {
            const id = req.user?.id;
            let condition = {};

            if (req.bodyString("user_id")) {
                condition.id = enc_dec.decrypt(req.bodyString("user_id"));
            } else if (req.bodyString("referral_code")) {
                condition.referral_code = req.bodyString("referral_code");
            } else {
                condition.id = id;
            }

            const result = await UserModel.select(condition, "users");

            let profile_data = {};

            if (result.length > 0) {
                const val = result[0];
                let category_name = await helpers.get_data_list(
                    "name",
                    "categories",
                    { id: val?.category_id }
                );
                let sub_category_name = await helpers.get_data_list(
                    "name",
                    "sub_categories",
                    { id: val?.sub_category_id }
                );
                let age = await helpers.calculateAge(val?.birth_date);
                profile_data = {
                    id: val?.id ? enc_dec.encrypt(val?.id) : "",
                    profile_img: val?.profile_img ? val?.profile_img : "",
                    referral_code: val?.referral_code ? val?.referral_code : "",
                    user_no: val?.user_no ? val?.user_no : "",
                    full_name: val?.full_name ? val?.full_name : "",
                    email: val?.email ? val?.email : "",
                    birth_date: val?.birth_date ? val?.birth_date : "",
                    age: age || "",
                    expert_request:
                        val?.expert_request == 1
                            ? "pending"
                            : val?.expert_request == 2
                            ? "rejected"
                            : "accepted",
                    status: val?.status == 0 ? "active" : "blocked",
                    gender: val?.gender ? val?.gender : "",
                    mobile_no: val?.mobile_no ? val?.mobile_no : "",
                    address: val?.address ? val?.address : "",
                    location: val?.location ? val?.location : "",
                    created_at: val?.created_at ? val?.created_at : "",
                    updated_at: val?.updated_at ? val?.updated_at : "",
                    id_type: val?.id_type ? val?.id_type : "",
                    id_img1: val?.id_img1 ? val?.id_img1 : "",
                    id_img2: val?.id_img2 ? val?.id_img2 : "",
                    house: val?.house ? val?.house : "",
                    street: val?.street ? val?.street : "",
                    city: val?.city ? val?.city : "",
                    zip: val?.zip ? val?.zip : "",
                    state: val?.state ? val?.state : "",
                    category_id: val?.category_id
                        ? enc_dec.encrypt(val?.category_id)
                        : "",
                    category_name: category_name.length
                        ? category_name[0].name
                        : "",
                    sub_category_id: val?.sub_category_id
                        ? enc_dec.encrypt(val?.sub_category_id)
                        : "",
                    sub_category_name: sub_category_name.length
                        ? sub_category_name[0].name
                        : "",
                };
            }

            res.status(200).json({
                status: true,
                data: profile_data,
                message: "Profile fetched successfully!",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: false,
                message: "Internal server error!",
            });
        }
    },

    change_phone: async (req, res) => {
        try {
            const currentDatetime = moment();
            let user_data = {
                mobile_no: req.bodyString("new_phone"),
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };
            console.log(user_data);

            UserModel.updateProfile({ user_id: req.user.id }, user_data)
                .then((result) => {
                    console.log(result);
                    res.status(200).json({
                        status: true,
                        message: "Phone updated successfully!",
                    });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).json({
                        status: false,
                        message: "Internal server error!",
                    });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: "Internal server error!",
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
                search.mobile_no = req.bodyString("search");
                search.email = req.bodyString("search");
                search.full_name = req.bodyString("search");
            }
            if (req.bodyString("type")) {
                condition.type = req.bodyString("type");
            }
            if (req.bodyString("status")) {
                condition.status = req.bodyString("status");
            }
            if (req.bodyString("expert_request")) {
                condition.expert_request = req.bodyString("expert_request");
            }
            if (req.bodyString("city")) {
                condition.city = req.bodyString("city");
            }
            if (req.bodyString("state")) {
                condition.state = req.bodyString("state");
            }
            if (req.bodyString("gender")) {
                condition.gender = req.bodyString("gender");
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

            const totalCount = await UserModel.get_count(
                condition,
                {},
                "users",
                search
            );
            console.log(totalCount);

            await UserModel.select_list(condition, {}, limit, "users", search)
                .then(async (result) => {
                    // console.log(result);

                    let response = [];
                    for (let val of result) {
                        let category_name = await helpers.get_data_list(
                            "name",
                            "categories",
                            { id: val?.category_id }
                        );
                        let sub_category_name = await helpers.get_data_list(
                            "name",
                            "sub_categories",
                            { id: val?.sub_category_id }
                        );
                        let age = await helpers.calculateAge(val?.birth_date);
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            expert_request:
                                val?.expert_request == 1
                                    ? "pending"
                                    : val?.expert_request == 2
                                    ? "rejected"
                                    : "accepted",
                            status: val?.status == 0 ? "active" : "blocked",
                            type: val?.type ? val?.type : "",
                            user_no: val?.user_no ? val?.user_no : "",
                            mobile_no: val?.mobile_no ? val?.mobile_no : "",
                            email: val?.email ? val?.email : "",
                            referral_code: val?.referral_code
                                ? val?.referral_code
                                : "",
                            age: age || "",
                            profile_img: val?.profile_img
                                ? val?.profile_img
                                : "",
                            full_name: val?.full_name ? val?.full_name : "",
                            gender: val?.gender ? val?.gender : "",
                            birth_date: val?.birth_date ? val?.birth_date : "",
                            id_type: val?.id_type ? val?.id_type : "",
                            id_img1: val?.id_img1 ? val?.id_img1 : "",
                            id_img2: val?.id_img2 ? val?.id_img2 : "",
                            house: val?.house ? val?.house : "",
                            street: val?.street ? val?.street : "",
                            city: val?.city ? val?.city : "",
                            zip: val?.zip ? val?.zip : "",
                            state: val?.state ? val?.state : "",
                            address: val?.address ? val?.address : "",
                            location: val?.location ? val?.location : "",
                            id_type: val?.id_type ? val?.id_type : "",
                            id_img1: val?.id_img1 ? val?.id_img1 : "",
                            id_img2: val?.id_img2 ? val?.id_img2 : "",
                            house: val?.house ? val?.house : "",
                            street: val?.street ? val?.street : "",
                            city: val?.city ? val?.city : "",
                            zip: val?.zip ? val?.zip : "",
                            state: val?.state ? val?.state : "",
                            category_id: val?.category_id
                                ? enc_dec.encrypt(val?.category_id)
                                : "",
                            category_name: category_name.length
                                ? category_name[0].name
                                : "",
                            sub_category_id: val?.sub_category_id
                                ? enc_dec.encrypt(val?.sub_category_id)
                                : "",
                            sub_category_name: sub_category_name.length
                                ? sub_category_name[0].name
                                : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Users fetched successfully!",
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

    block_unblock: async (req, res) => {
        let id = enc_dec.decrypt(req.bodyString("user_id"));
        let status = req.bodyString("status");
        let msgStatus = "";
        if (status == 1) {
            msgStatus = "blocked";
        } else {
            msgStatus = "unblocked";
        }
        try {
            let user_data = {
                status: status,
                updated_at: moment().format("YYYY-MM-DD HH:mm"),
            };
            await UserModel.updateDetails({ id: id }, user_data, "users");
            res.status(200).json({
                status: true,
                message: `User ${msgStatus} successfully!`,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },

    delete: async (req, res) => {
        let id = enc_dec.decrypt(req.bodyString("user_id"));

        try {
            let user_data = {
                deleted: req.bodyString("deleted"),
                updated_at: moment().format("YYYY-MM-DD HH:mm"),
            };
            await UserModel.updateDetails({ id: id }, user_data, "users");
            res.status(200).json({
                status: true,
                message: `User deleted successfully!`,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: true,
                message: `Unable to delete user.`,
            });
        }
    },

    login_list: async (req, res) => {
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
            let id = enc_dec.decrypt(req.bodyString("id"));

            const totalCount = await UserModel.get_count(
                { user_id: id },
                {},
                "login_history"
            );
            await UserModel.select_list(
                { user_id: id },
                {},
                limit,
                "login_history"
            )
                .then(async (result) => {
                    res.status(200).json({
                        status: true,
                        data: result,
                        message: "Login history fetched successfully!",
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

module.exports = AuthController;
