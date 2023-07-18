require("dotenv").config();
const UserModel = require("../model/userModel");
const CustomerModel = require("../model/customers");
const accessToken = require("../utilities/tokenmanager/token");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");
const otpSender = require("../utilities/sms/sentotp");
const SequenceUUID = require("sequential-uuid");
const jwt = require("jsonwebtoken");
const moment = require("moment");

var AuthController = {
    register: async (req, res) => {
        const { user_id, password } = req.body;
        try {
            let table = "";
            let email = "";
            let mobile_no = "";
            let user_data = {};
            // Regular expression pattern for email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(user_id)) {
                // The email is valid
                email = user_id;
                user_data.email = email;
            } else {
                // The email is invalid
                mobile_no = user_id;
                user_data.mobile_no = mobile_no;
            }

            if (req.bodyString("type") === "client") {
                table = "clients";
            } else {
                table = "experts";
            }

            try {
                let hashPassword = enc_dec.encrypt(password);
                user_data.password = hashPassword;
                await UserModel.add(user_data, table)
                    .then(async (result) => {
                        // jwt token
                        let payload = {
                            id: result.insert_id,
                            type: req.bodyString("type"),
                        };
                        const token = accessToken(payload);
                        res.status(200).json({
                            status: true,
                            token: token,
                            message: "User register successfully!",
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500).json({
                            status: false,
                            message: "User registration failed!",
                        });
                    });
            } catch (error) {
                console.log(error);
                res.status(500).json({
                    status: false,
                    message: error.message,
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

    login: async (req, res) => {
        const { user_id, password } = req.body;
        try {
            let table;
            let email = "";
            let mobile_no = "";
            let user_data = {};
            // Regular expression pattern for email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(user_id)) {
                // The email is valid
                email = user_id;
                user_data.email = email;
            } else {
                // The email is invalid
                mobile_no = user_id;
                user_data.mobile_no = mobile_no;
            }

            if (req.bodyString("type")) {
                if (req.bodyString("type") === "client") {
                    table = "clients";
                } else {
                    table = "experts";
                }
            }

            try {
                let check_user_exist = await helpers.get_data_list(
                    "*",
                    table,
                    user_data
                );
                // console.log("hashPassword", hashPassword);
                let plain_pass = enc_dec.decrypt(check_user_exist[0].password);

                if (plain_pass !== password) {
                    res.status(500).json({
                        status: false,
                        message: "Wrong password!",
                    });
                } else {
                    await UserModel.select(user_data, table)
                        .then(async (result) => {
                            // jwt token
                            let payload = {
                                id: result[0].id,
                                type: req.bodyString("type"),
                            };
                            const token = accessToken(payload);
                            res.status(200).json({
                                status: true,
                                token: token,
                                message: "User login successfully!",
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(500).json({
                                status: false,
                                message: "User login failed!",
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
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: error.message,
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

    resend_otp: async (req, res) => {
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
                    // delete old OTP entry from table
                    let condition = {
                        mobile_code: mobile_code,
                        mobile_no: mobile_no,
                    };
                    await helpers.delete_common_entry(condition, "mobile_otp");

                    // adding new otp entry
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

    otp_verify: async (req, res) => {
        try {
            let selection = "id,mobile_code,mobile_no,sms_id";
            let condition = {
                otp: req.bodyString("otp"),
                token: req.bodyString("otp_token"),
            };
            CustomerModel.selectMobileOtpData(selection, condition)
                .then(async (result) => {
                    if (result) {
                        let userData = {
                            type: req.bodyString("type"),
                            mobile_code: result.mobile_code,
                            mobile_no: result.mobile_no,
                        };
                        await UserModel.updateDetails({}, userData)
                            .then(async (result) => {
                                let profile_data = {
                                    user_id: result.insert_id,
                                    mobile_no: userData.mobile_no,
                                };
                                // user details
                                await UserModel.addProfile(profile_data);

                                // jwt token
                                let payload = {
                                    id: result.insert_id,
                                    type: "user",
                                };
                                const token = accessToken(payload);

                                // delete OTP entry from table
                                await helpers.delete_common_entry(
                                    condition,
                                    "mobile_otp"
                                );

                                res.status(200).json({
                                    status: true,
                                    token: token,
                                    message:
                                        "OTP verified. User created successfully!",
                                });
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(500).json({
                                    status: false,
                                    message: "Internal server error!",
                                });
                            });
                    } else {
                        res.status(500).json({
                            status: false,
                            message: "Wrong OTP, Try again!",
                        });
                    }
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

    forget_password: async (req, res) => {
        const { password } = req.body;
        try {
            let check_user_exist = await helpers.get_data_list("*", "users", {
                id: req.user.id,
                deleted: 0,
            });
            console.log("hashPassword", hashPassword);
            let plain_pa = enc_dec.decrypt(check_user_exist[0].password);
            if (plain_pa !== password) {
                res.status(500).json({
                    status: false,
                    message: "Wrong password!",
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

    update_profile: async (req, res) => {
        try {
            const currentDatetime = moment();
            let user_data = {
                full_name: req.bodyString("full_name"),
                email: req.bodyString("email"),
                mobile_no: req.bodyString("mobile_no"),
                gender: req.bodyString("gender"),
                birth_date: req.bodyString("birth_date"),
                address: req.bodyString("address"),
                profile_img: req.all_files?.profile_img,
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };
            console.log(user_data);

            UserModel.updateProfile({ user_id: req.user.id }, user_data)
                .then((result) => {
                    console.log(result);
                    res.status(200).json({
                        status: true,
                        message: "Profile updated successfully!",
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

    update_location: async (req, res) => {
        try {
            const currentDatetime = moment();
            let user_data = {
                location: req.bodyString("location"),
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };
            console.log(user_data);

            UserModel.updateProfile({ user_id: req.user.id }, user_data)
                .then((result) => {
                    console.log(result);
                    res.status(200).json({
                        status: true,
                        message: "Profile location updated successfully!",
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

    profile_details: async (req, res) => {
        try {
            let user_id = req.user.id;
            UserModel.select_profile({ user_id: user_id })
                .then((result) => {
                    let profile_data;
                    for (let val of result) {
                        profile_data = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            profile_img: val?.profile_img
                                ? val?.profile_img
                                : "",
                            full_name: val?.full_name ? val?.full_name : "",
                            email: val?.email ? val?.email : "",
                            birth_date: val?.birth_date ? val?.birth_date : "",
                            gender: val?.gender ? val?.gender : "",
                            mobile_no: val?.mobile_no ? val?.mobile_no : "",
                            address: val?.address ? val?.address : "",
                            created_at: val?.created_at ? val?.created_at : "",
                            updated_at: val?.updated_at ? val?.updated_at : "",
                        };
                    }
                    res.status(200).json({
                        status: true,
                        data: profile_data,
                        message: "Profile fetched successfully!",
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
};

module.exports = AuthController;
