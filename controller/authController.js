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
const email_service = require("../utilities/mail/emailService");
let static_url = process.env.STATIC_FILE_URL;

var AuthController = {
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

    add_password: async (req, res) => {
        const { password } = req.body;
        try {
            let table = "";
            let user_data = {};

            if (req.user.type === "client") {
                table = "clients";
            } else {
                table = "experts";
            }

            try {
                let hashPassword = enc_dec.encrypt(password);
                user_data.password = hashPassword;
                await UserModel.updateDetails(
                    { id: req.user.id },
                    user_data,
                    table
                )
                    .then(async (result) => {
                        // jwt token
                        let payload = {
                            id: req.user.id,
                            type: req.user.type,
                        };
                        const token = accessToken(payload);
                        res.status(200).json({
                            status: true,
                            token: token,
                            message: "User password added successfully!",
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500).json({
                            status: false,
                            message: "Failed to add user password!",
                        });
                    });
            } catch (error) {
                console.log(error);
                res.status(500).json({
                    status: false,
                    message: "Server side error!",
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: "Server side error!",
            });
        }
    },

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

            return res.status(200).json({
                status: true,
                token,
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

            let expert = await helpers.get_data_list("*", "experts", user_data);
            let client = await helpers.get_data_list("*", "clients", user_data);

            if (expert.length) {
                table = "experts";
            } else if (client.length) {
                table = "clients";
            } else {
                res.status(500).json({
                    status: false,
                    message: "User not found!",
                });
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
                                type: table == "experts" ? "expert" : "client",
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

    password_send_otp: async (req, res) => {
        const { mobile_code, mobile_no, email, type } = req.body;
        try {
            let otp = await helpers.generateOtp(6);
            const mobile_number = `${mobile_code}${mobile_no}`;
            const welcomeMessage =
                "Your verification code is: " +
                otp +
                ". Do not share it with anyone.";

            console.log("mobile_number", mobile_number);
            console.log("welcomeMessage", welcomeMessage);

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

    password_otp_verify: async (req, res) => {
        try {
            let condition = {
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
            if (result.email) {
                user_data.email = result.email;
            }
            if (result.mobile_no) {
                user_data.mobile_no = result.code + result.mobile_no;
            }

            let table;
            const client = await helpers.get_data_list(
                "*",
                "clients",
                user_data
            );
            const expert = await helpers.get_data_list(
                "*",
                "experts",
                user_data
            );

            if (client.length) {
                table = "clients";
            } else if (expert.length) {
                table = "experts";
            } else {
                return res.status(500).json({
                    status: false,
                    message: "User not found!",
                });
            }

            const resultUser = await UserModel.select(user_data, table);

            if (resultUser.length) {
                // jwt token
                let payload = {
                    id: resultUser[0].id,
                    type: table === "clients" ? "client" : "expert",
                };
                const token = accessToken(payload);

                // delete OTP entry from table
                await helpers.delete_common_entry(condition, "mobile_otp");

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

    otp_verify: async (req, res) => {
        try {
            let condition = {
                otp: req.bodyString("otp"),
                token: req.bodyString("otp_token"),
            };
            CustomerModel.selectMobileOtpData(condition)
                .then(async (result) => {
                    if (result) {
                        let table = "clients";
                        let userData = {
                            mobile_no: result.mobile_code + result.mobile_no,
                        };
                        await UserModel.add(userData, table)
                            .then(async (result) => {
                                let profile_data = {
                                    user_id: result.insert_id,
                                    type: "client",
                                    mobile_no: userData.mobile_no,
                                };
                                // user details
                                await UserModel.addProfile(profile_data);

                                // jwt token
                                let payload = {
                                    id: result.insert_id,
                                    type: "client",
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

                const userData = { mobile_no };
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

    check_user: async (req, res) => {
        try {
            let check_mobile_exist_client;
            let check_mobile_exist_expert;
            let check_email_exist_client;
            let check_email_exist_expert;
            if (req.bodyString("mobile_no")) {
                check_mobile_exist_client = await helpers.get_data_list(
                    "*",
                    "clients",
                    {
                        mobile_no: req.bodyString("mobile_no"),
                    }
                );
                check_mobile_exist_expert = await helpers.get_data_list(
                    "*",
                    "experts",
                    {
                        mobile_no: req.bodyString("mobile_no"),
                    }
                );
                if (check_mobile_exist_expert.length > 0) {
                    res.status(200).json({
                        status: true,
                        error: "User found with this mobile number",
                    });
                } else if (check_mobile_exist_client.length > 0) {
                    res.status(200).json({
                        status: true,
                        error: "User found with this mobile number",
                    });
                } else {
                    res.status(500).json({
                        status: false,
                        error: "No user found with this mobile number!",
                    });
                }
            }

            if (req.bodyString("email")) {
                check_email_exist_client = await helpers.get_data_list(
                    "*",
                    "clients",
                    {
                        email: req.bodyString("email"),
                    }
                );

                check_email_exist_expert = await helpers.get_data_list(
                    "*",
                    "experts",
                    {
                        email: req.bodyString("email"),
                    }
                );

                if (check_email_exist_expert.length > 0) {
                    res.status(200).json({
                        status: true,
                        error: "User found with this email address",
                    });
                } else if (check_email_exist_client.length > 0) {
                    res.status(200).json({
                        status: true,
                        error: "User found with this email address",
                    });
                } else {
                    res.status(500).json({
                        status: false,
                        error: "No user found with this email address!",
                    });
                }
            }
        } catch (error) {
            res.status(500).json({
                status: false,
                error: "Server side error!",
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
                profile_img:
                    static_url + "profile/" + req.all_files?.profile_img,
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };
            console.log(user_data);

            UserModel.updateProfile(
                { user_id: req.user.id, type: req.user.type },
                user_data
            )
                .then((result) => {
                    let table;
                    if (req.user.type === "client") {
                        table = "clients";
                    } else {
                        table = "experts";
                    }

                    UserModel.updateDetails(
                        { id: req.user.id },
                        { email: req.bodyString("email") },
                        table
                    )
                        .then((result) => {
                            res.status(200).json({
                                status: true,
                                message: "Profile updated successfully!",
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(500).json({
                                status: false,
                                message: "Failed to update profile!",
                            });
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

    become_expert_request: async (req, res) => {
        try {
            const currentDatetime = moment();
            let user_data = {
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
            console.log(user_data);

            UserModel.updateProfile(
                { user_id: req.user.id, type: "client" },
                user_data
            )
                .then(async (result) => {
                    res.status(200).json({
                        status: true,
                        message: "Expert request submitted successfully",
                    });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).json({
                        status: false,
                        message: "Unable to submit expert request!",
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

    accept_expert_request: async (req, res) => {
        try {
            const currentDatetime = moment();
            let user_id = enc_dec.decrypt(req.bodyString("user_id"));
            let user_data = {
                expert_request: req.bodyString("status"),
                updated_at: currentDatetime.format("YYYY-MM-DD HH:mm:ss"),
            };
            if (req.bodyString("status") == 0) {
                user_data.type = "expert";
            }
            console.log(user_data);

            UserModel.updateProfile(
                { user_id: user_id, type: "client" },
                user_data
            )
                .then(async (result) => {
                    if (req.bodyString("status") == 0) {
                        let userData = await UserModel.select(
                            { id: user_id },
                            "clients"
                        );
                        let data = {
                            password: userData[0]?.password
                                ? userData[0]?.password
                                : "",
                            email: userData[0]?.email ? userData[0]?.email : "",
                            mobile_no: userData[0]?.mobile_no
                                ? userData[0]?.mobile_no
                                : "",
                            status: userData[0]?.status
                                ? userData[0]?.status
                                : "",
                            created_at: userData[0]?.created_at
                                ? userData[0]?.created_at
                                : "",
                            updated_at: userData[0]?.updated_at
                                ? userData[0]?.updated_at
                                : "",
                        };
                        await UserModel.add(data, "expert");
                        await UserModel.delete({ id: req.user.id }, "clients");
                    }
                    res.status(200).json({
                        status: true,
                        message: "Request status changed successfully",
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
            const id = req.user?.id;
            const type = req.user?.type;

            const result = await UserModel.select({ id, type }, "users");

            let profile_data = {};

            for (let val of result) {
                profile_data = {
                    id: val?.id ? enc_dec.encrypt(val?.id) : "",
                    profile_img: val?.profile_img ? val?.profile_img : "",
                    full_name: val?.full_name ? val?.full_name : "",
                    email: val?.email ? val?.email : "",
                    birth_date: val?.birth_date ? val?.birth_date : "",
                    gender: val?.gender ? val?.gender : "",
                    mobile_no: val?.mobile_no ? val?.mobile_no : "",
                    address: val?.address ? val?.address : "",
                    location: val?.location ? val?.location : "",
                    created_at: val?.created_at ? val?.created_at : "",
                    updated_at: val?.updated_at ? val?.updated_at : "",
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

    expert_request_list: async (req, res) => {
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

            let condition = { expert_request: 1 };

            const totalCount = await UserModel.get_count(
                condition,
                {},
                "user_details"
            );
            console.log(totalCount);

            await UserModel.select_list(condition, {}, limit, "user_details")
                .then(async (result) => {
                    console.log(result);
                    let response = [];
                    for (let val of result) {
                        let temp = {
                            id: val?.id ? enc_dec.encrypt(val?.id) : "",
                            user_id: val?.user_id
                                ? enc_dec.encrypt(val?.user_id)
                                : "",
                            type: val?.type ? val?.type : "",
                            full_name: val?.full_name ? val?.full_name : "",
                            email: val?.email ? val?.email : "",
                            gender: val?.gender ? val?.gender : "",
                            mobile_no: val?.mobile_no ? val?.mobile_no : "",
                            birth_date: val?.birth_date ? val?.birth_date : "",
                            address: val?.address ? val?.address : "",
                            location: val?.location ? val?.location : "",
                            profile_img: val?.profile_img
                                ? val?.profile_img
                                : "",
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
                        response.push(temp);
                    }
                    res.status(200).json({
                        status: true,
                        data: response,
                        message: "Expert request list fetched successfully!",
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
