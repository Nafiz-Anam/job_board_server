require("dotenv").config();
const AccountModel = require("../model/accountModel");
const enc_dec = require("../utilities/decryptor/decryptor");
const helpers = require("../utilities/helper/general_helper");

var AccountController = {
    add_money: async (req, res) => {
        let user_id = req.user.id;
        try {
            let data = {
                user_id: user_id,
                amount: req.bodyString("amount"),
                method: req.bodyString("method"),
                account_id: enc_dec.decrypt(req.bodyString("account_id")),
                transaction_id: req.bodyString("transaction_id"),
                receipt_img: req.all_files.receipt_img,
            };
            await AccountModel.add(data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Add money request sent successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to send request. Try again!",
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

    send_money: async (req, res) => {
        let user_id = req.user.id;
        try {
            let mobile_no = req.bodyString("mobile_no");
            const lastTen = mobile_no.substr(-10);
            let user = await helpers.get_data_list("id", "users", {
                mobile_no: lastTen,
                deleted: 0,
            });
            console.log(user);

            let data = {
                user_id: user_id,
                sent_user_id: user[0]?.id,
                mobile_no: req.bodyString("mobile_no"),
                amount: req.bodyString("amount"),
                commission: req.bodyString("commission"),
            };
            await AccountModel.add_send_money_req(data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Send money request sent successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to send request. Try again!",
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

    mobile_recharge: async (req, res) => {
        let user_id = req.user.id;
        try {
            let data = {
                user_id: user_id,
                operator_type: req.bodyString("operator_type"),
                operator: req.bodyString("operator"),
                mobile_no: req.bodyString("mobile_no"),
                amount: req.bodyString("amount"),
            };
            await AccountModel.add_mobile_recharge_req(data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "Mobile recharge request sent successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to send request. Try again!",
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

    transactions: async (req, res) => {
        let user_id = req.user.id;
        try {
            let add_money_data = await helpers.get_data_list("*", "add_money", {
                user_id: user_id,
                status: 0,
            });
            // console.log(add_money_data);
            let add_money_history = [];
            for (let val of add_money_data) {
                let temp = {
                    id: val?.id ? enc_dec.encrypt(val?.id) : "",
                    user_id: val?.user_id ? enc_dec.encrypt(val?.user_id) : "",
                    amount: val?.amount ? val?.amount : "",
                    method: val?.method ? val?.method : "",
                    account_id: val?.account_id
                        ? enc_dec.encrypt(val?.account_id)
                        : "",
                    transaction_id: val?.transaction_id
                        ? val?.transaction_id
                        : "",
                    receipt_img: val?.receipt_img ? val?.receipt_img : "",
                    created_at: val?.created_at ? val?.created_at : "",
                };
                add_money_history.push(temp);
            }

            let send_money_data = await helpers.get_data_list(
                "*",
                "send_money",
                {
                    user_id: user_id,
                    status: 0,
                }
            );
            // console.log(send_money_data);
            let send_money_history = [];
            for (let val of add_money_data) {
                let temp = {
                    id: val?.id ? enc_dec.encrypt(val?.id) : "",
                    user_id: val?.user_id ? enc_dec.encrypt(val?.user_id) : "",
                    amount: val?.amount ? val?.amount : "",
                    sent_user_id: val?.sent_user_id
                        ? enc_dec.encrypt(val?.sent_user_id)
                        : "",
                    commission: val?.commission ? val?.commission : 0,
                    created_at: val?.created_at ? val?.created_at : "",
                };
                send_money_history.push(temp);
            }

            let mobile_recharge_data = await helpers.get_data_list(
                "*",
                "mobile_recharge",
                {
                    user_id: user_id,
                    status: 0,
                }
            );
            // console.log(mobile_recharge_data);
            let mobile_recharge_history = [];
            for (let val of add_money_data) {
                let temp = {
                    id: val?.id ? enc_dec.encrypt(val?.id) : "",
                    user_id: val?.user_id ? enc_dec.encrypt(val?.user_id) : "",
                    amount: val?.amount ? val?.amount : "",
                    mobile_no: val?.mobile_no ? val?.mobile_no : "",
                    operator_type: val?.operator_type ? val?.operator_type : "",
                    operator: val?.operator ? val?.operator : "",
                    created_at: val?.created_at ? val?.created_at : "",
                };
                mobile_recharge_history.push(temp);
            }

            let send_res = {
                add_money_history,
                send_money_history,
                mobile_recharge_history,
            };
            res.status(200).json({
                status: true,
                data: send_res,
                message: "Transactions fetched successfully!",
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: false,
                message: "Server side error! Try again.",
            });
        }
    },

    kyc_validation: async (req, res) => {
        let user_id = req.user.id;
        try {
            let kyc_data = {
                user_id: user_id,
                full_name: req.bodyString("full_name"),
                father_name: req.bodyString("father_name"),
                mother_name: req.bodyString("mother_name"),
                birth_date: req.bodyString("birth_date"),
                nid_no: req.bodyString("nid_no"),
                blood_group: req.bodyString("blood_group"),
                gender: req.bodyString("gender"),
                source_of_fund: req.bodyString("source_of_fund"),
                monthly_income: req.bodyString("monthly_income"),
                occupation: req.bodyString("occupation"),
                nid_front_img: req.all_files.nid_front_img,
                nid_back_img: req.all_files.nid_back_img,
                user_img: req.all_files.user_img,
            };
            await AccountModel.add_kyc(kyc_data)
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        message: "KYC validation request submitted successfully!",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        status: false,
                        message: "Unable to submit request. Try again!",
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
};

module.exports = AccountController;
