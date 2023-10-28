const Joi = require("joi");
const helpers = require("../helper/general_helper");

const authValidation = {
    add_password: async (req, res, next) => {
        const schema = Joi.object({
            password: Joi.string().required().min(6).max(16).messages({
                "any.required": "Password is required",
                "string.min": "Password must be at least 6 characters long",
                "string.max": "Password cannot exceed 16 characters",
                "string.empty": "Password cannot be empty",
            }),
            confirm_password: Joi.string()
                .required()
                .valid(Joi.ref("password"))
                .messages({
                    "any.required": "Confirm Password is required",
                    "string.min":
                        "Confirm Password must be at least 6 characters long",
                    "string.max":
                        "Confirm Password cannot exceed 16 characters",
                    "string.empty": "Confirm Password cannot be empty",
                    "any.only":
                        "Password confirmation must match the entered password",
                }),
        });

        try {
            const result = schema.validate(req.body);
            if (result.error) {
                res.status(500).json({
                    status: false,
                    error: result.error.message,
                });
            } else {
                next();
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                error: "Server side error!",
            });
        }
    },

    login: async (req, res, next) => {
        const schema = Joi.object({
            // type: Joi.string().required().messages({
            //     "any.required": "Type is required",
            //     "string.empty": "Type cannot be empty",
            // }),
            user_id: Joi.string().required().messages({
                "any.required": "User id is required",
                "string.empty": "User id cannot be empty",
            }),
            password: Joi.string().required().min(6).max(16).messages({
                "any.required": "Password is required",
                "string.min": "Password must be at least 6 characters long",
                "string.max": "Password cannot exceed 16 characters",
                "string.empty": "Password cannot be empty",
            }),
        });

        try {
            let table = "";
            if (req.bodyString("type") === "client") {
                table = "clients";
            } else {
                table = "experts";
            }

            let check_mobile_exist = await helpers.get_data_list("*", table, {
                mobile_no: req.bodyString("user_id"),
            });
            console.log(check_mobile_exist);
            let check_email_exist = await helpers.get_data_list("*", table, {
                email: req.bodyString("user_id"),
            });
            console.log(check_email_exist);

            const result = schema.validate(req.body);
            if (result.error) {
                res.status(500).json({
                    status: false,
                    error: result.error.message,
                });
            } else if (
                check_mobile_exist.length > 0 ||
                check_email_exist.length > 0
            ) {
                next();
            } else {
                res.status(500).json({
                    status: false,
                    error: "User not found!",
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                error: "Server side error!",
            });
        }
    },

    check_user: async (req, res, next) => {
        const schema = Joi.object({
            // type: Joi.string().required().messages({
            //     "any.required": "Type is required",
            //     "string.empty": "Type cannot be empty",
            // }),
            mobile_code: Joi.string().required().min(3).messages({
                "any.required": "Mobile code is required",
                "string.min": "Mobile code must be at least 3 characters long",
                "string.empty": "Mobile code cannot be empty",
            }),
            mobile_no: Joi.string().required().min(10).messages({
                "any.required": "Mobile number is required",
                "string.min":
                    "Mobile number must be at least 10 characters long",
                "string.empty": "Mobile number cannot be empty",
            }),
        });

        try {
            let table = "clients";
            // if (req.bodyString("type") === "client") {
            //     table = "clients";
            // } else {
            //     table = "experts";
            // }

            let check_mobile_exist = await helpers.get_data_list("*", table, {
                mobile_no: req.bodyString("mobile_no"),
            });
            console.log(check_mobile_exist);
            const result = schema.validate(req.body);
            if (result.error) {
                res.status(500).json({
                    status: false,
                    error: result.error.message,
                });
            } else if (check_mobile_exist.length > 0) {
                res.status(500).json({
                    status: false,
                    error: "Mobile no. already exist!",
                });
            } else {
                next();
            }
        } catch (error) {
            res.status(500).json({
                status: false,
                error: "Server side error!",
            });
        }
    },

    otp_verify: async (req, res, next) => {
        const schema = Joi.object({
            otp: Joi.string().required().length(6).messages({
                "any.required": "OTP is required",
                "string.length": "OTP must be exactly 6 characters long",
                "string.empty": "OTP cannot be empty",
            }),
            otp_token: Joi.string().required().messages({
                "any.required": "OTP token is required",
                "string.empty": "OTP token cannot be empty",
            }),
        });

        try {
            let get_mobile = await helpers.get_data_list(
                "mobile_code,mobile_no",
                "otps",
                {
                    token: req.bodyString("otp_token"),
                }
            );
            let table = "users";
            let check_user_exist = await helpers.get_data_list("*", table, {
                mobile_no:
                    get_mobile[0]?.mobile_code + get_mobile[0]?.mobile_no,
            });
            console.log(check_user_exist);

            const result = schema.validate(req.body);
            if (result.error) {
                res.status(500).json({
                    status: false,
                    error: result.error.message,
                });
            } else if (check_user_exist.length > 0) {
                res.status(500).json({
                    status: false,
                    error: "User already registered. Please login!",
                });
            } else {
                next();
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                error: "Server side error!",
            });
        }
    },

    set_pin: async (req, res, next) => {
        const schema = Joi.object({
            token: Joi.string().required().messages({
                "any.required": "Token is required",
                "string.empty": "Token cannot be empty",
            }),
            pin: Joi.string().required().length(4).pattern(/^\d+$/).messages({
                "any.required": "PIN is required",
                "string.base": "PIN must be a string",
                "string.empty": "PIN cannot be empty",
                "string.length": "PIN must be exactly 4 characters long",
                "string.pattern.base": "PIN must contain only digits",
            }),
            confirm_pin: Joi.string()
                .required()
                .valid(Joi.ref("pin"))
                .messages({
                    "any.required": "PIN confirmation is required",
                    "string.empty": "PIN confirmation cannot be empty",
                    "any.only": "PIN confirmation must match the entered PIN",
                }),
        });

        try {
            const result = schema.validate(req.body);
            if (result.error) {
                res.status(500).json({
                    status: false,
                    error: result.error.message,
                });
            } else {
                next();
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                error: "Server side error!",
            });
        }
    },

    change_pin: async (req, res, next) => {
        const schema = Joi.object({
            old_pin: Joi.string()
                .required()
                .length(4)
                .pattern(/^\d+$/)
                .messages({
                    "any.required": "Old PIN is required",
                    "string.base": "Old PIN must be a string",
                    "string.empty": "Old PIN cannot be empty",
                    "string.length":
                        "Old PIN must be exactly 4 characters long",
                    "string.pattern.base": "Old PIN must contain only digits",
                }),
            new_pin: Joi.string()
                .required()
                .length(4)
                .pattern(/^\d+$/)
                .messages({
                    "any.required": "New PIN is required",
                    "string.base": "New PIN must be a string",
                    "string.empty": "New PIN cannot be empty",
                    "string.length":
                        "New PIN must be exactly 4 characters long",
                    "string.pattern.base": "New PIN must contain only digits",
                }),
            confirm_new_pin: Joi.string()
                .required()
                .valid(Joi.ref("new_pin"))
                .messages({
                    "any.required": "New PIN confirmation is required",
                    "string.empty": "New PIN confirmation cannot be empty",
                    "any.only":
                        "New PIN confirmation must match the entered PIN",
                }),
        });

        try {
            const result = schema.validate(req.body);
            if (result.error) {
                res.status(500).json({
                    status: false,
                    error: result.error.message,
                });
            } else {
                next();
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                error: "Server side error!",
            });
        }
    },

    // login: async (req, res, next) => {
    //     const schema = Joi.object({
    //         mobile_code: Joi.string().required().min(3).messages({
    //             "any.required": "Mobile code is required",
    //             "string.min": "Mobile code must be at least 3 characters long",
    //             "string.empty": "Mobile code cannot be empty",
    //         }),
    //         mobile_no: Joi.string().required().min(10).messages({
    //             "any.required": "Mobile number is required",
    //             "string.min":
    //                 "Mobile number must be at least 10 characters long",
    //             "string.empty": "Mobile number cannot be empty",
    //         }),
    //         password: Joi.string().required().min(6).max(16).messages({
    //             "any.required": "Password is required",
    //             "string.min": "Password must be at least 6 characters long",
    //             "string.max": "Password cannot exceed 16 characters",
    //             "string.empty": "Password cannot be empty",
    //         }),
    //     });

    //     try {
    //         const result = schema.validate(req.body);
    //         if (result.error) {
    //             res.status(500).json({
    //                 status: false,
    //                 error: result.error.message,
    //             });
    //         } else {
    //             next();
    //         }
    //     } catch (error) {
    //         res.status(500).json({
    //             status: false,
    //             error: "Server side error!",
    //         });
    //     }
    // },

    update_profile: async (req, res, next) => {
        const schema = Joi.object({
            full_name: Joi.string().required().messages({
                "any.required": "Full name is required",
                "string.empty": "Full name cannot be empty",
            }),
            email: Joi.string().required().messages({
                "any.required": "Email is required",
                "string.empty": "Email cannot be empty",
            }),
            address: Joi.string().required().messages({
                "any.required": "Address is required",
                "string.empty": "Address cannot be empty",
            }),
            birth_date: Joi.date().iso().required().messages({
                "any.required": "Birth date is required",
                "date.base": "Birth date must be a valid date",
                "date.format": "Birth date must be in the format YYYY-MM-DD",
            }),
            gender: Joi.string().valid("male", "female").required().messages({
                "any.required": "Gender is required",
                "any.only": "Gender must be one of 'male', or 'female'",
            }),
            mobile_no: Joi.string().required().messages({
                "any.required": "Mobile number is required",
                "string.empty": "Mobile number cannot be empty",
            }),
        });
        try {
            const result = schema.validate(req.body);
            if (result.error) {
                res.status(503).json({
                    status: false,
                    error: result.error.message,
                });
            } else {
                next();
            }
        } catch (error) {
            res.status(503).json({
                status: false,
                error: "Server side error!",
            });
        }
    },
};

module.exports = authValidation;
