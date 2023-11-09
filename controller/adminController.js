require("dotenv").config();
const AdminModel = require("../model/adminModel");
const accessToken = require("../utilities/tokenmanager/token");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");
const email_service = require("../utilities/mail/emailService");

var AdminController = {
    login: async (req, res) => {
        try {
            let foundUser = await AdminModel.select({
                user_name: req.bodyString("user_name"),
            });

            if (foundUser.length > 0) {
                let submittedPass = req.bodyString("password");
                let plainPassword = await enc_dec.decrypt(
                    foundUser[0].password
                );

                if (submittedPass === plainPassword) {
                    payload = {
                        id: foundUser[0].id,
                        type: foundUser[0].type,
                    };
                    const token = accessToken(payload);

                    res.status(200).json({
                        status: true,
                        token: token,
                        message: "Admin logged in successfully!",
                    });
                } else {
                    res.status(500).json({
                        status: false,
                        data: {},
                        error: "Wrong Password!",
                    });
                }
            } else {
                res.status(500).json({
                    status: false,
                    data: {},
                    error: "Admin not found!",
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: "Internal server error!",
            });
        }
    },

    check_admin: async (req, res) => {
        try {
            let foundUser = await AdminModel.select({
                user_name: req.bodyString("user_name"),
            });
            const otp = await helpers.generateOtp(6);
            const message = `Your verification code is: ${otp}. Do not share it with anyone.`;

            if (foundUser.length > 0) {
                await email_service(foundUser[0]?.email, message).then(
                    async (result) => {
                        // adding otp entry
                        let otp_payload = {
                            otp: otp,
                            email: foundUser[0]?.email,
                        };
                        await AdminModel.add_otp(otp_payload);

                        let payload = {
                            id: foundUser[0].id,
                            type: foundUser[0].type,
                        };
                        const token = accessToken(payload);

                        res.status(200).json({
                            status: true,
                            token: token,
                            message: "Verification OTP sent successfully!",
                        });
                    }
                );
            } else {
                res.status(404).json({
                    status: false,
                    data: {},
                    error: "Admin not found!",
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: "Internal server error!",
            });
        }
    },

    password_otp_verify: async (req, res) => {
        try {
            let foundUser = await AdminModel.select({
                id: req.user.id,
            });
            const condition = {
                otp: req.bodyString("otp"),
                email: foundUser[0]?.email,
            };

            const result = await AdminModel.select_otp(condition);

            if (!result) {
                return res.status(401).json({
                    status: false,
                    message: "Wrong OTP, Try again!",
                });
            }

            if (foundUser.length) {
                // jwt token
                const payload = {
                    id: foundUser[0].id,
                    type: foundUser[0].type,
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
                return res.status(404).json({
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

    change_password: async (req, res) => {
        try {
            let admin_data = {
                password: enc_dec.encrypt(req.bodyString("password")),
            };
            await AdminModel.updateDetails({ id: req.user.id }, admin_data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Password updated successfully!",
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

module.exports = AdminController;
