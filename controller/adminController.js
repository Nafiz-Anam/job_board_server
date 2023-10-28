require("dotenv").config();
const AdminModel = require("../model/adminModel");
const accessToken = require("../utilities/tokenmanager/token");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");

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

            if (foundUser.length > 0) {
                payload = {
                    id: foundUser[0].id,
                    type: foundUser[0].type,
                };
                const token = accessToken(payload);

                res.status(200).json({
                    status: true,
                    token: token,
                    message: "Admin fetched successfully!",
                });
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
