const env = process.env.ENVIRONMENT;
const config = require("../../config/config.json")[env];
const pool = require("../../config/database");
const useragent = require("express-useragent");
const requestIp = require("request-ip");
const axios = require("axios");

const randomString = (length, capslock = 0) => {
    let chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = length; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    if (capslock == 1) {
        return result.toUpperCase();
    } else {
        return result;
    }
};

var helpers = {
    generatePassword: async () => {
        let randomPass = await randomString(8);
        console.log("randomPass", randomPass);
        return randomPass;
    },

    total_ref_count: async (referral_code) => {
        let qb = await pool.get_connection();
        let query = `SELECT COUNT(*) AS total_referrals
                    FROM mx_users
                    WHERE referred_by = '${referral_code};'`;
        let response = await qb.query(query);
        console.log(query);
        qb.release();

        return response;
    },

    total_complete_job_count: async (expert_id) => {
        let qb = await pool.get_connection();
        let query = `SELECT SUM(total_count) AS total_complete_jobs FROM ( SELECT COUNT(*) AS total_count FROM mx_applied_jobs WHERE work_status = 0 AND req_status = 0 AND deleted = 0 AND expert_id = ${expert_id} UNION ALL SELECT COUNT(*) AS total_count FROM mx_bookings WHERE work_status = 0 AND req_status = 0 AND cancelled = 0 AND deleted = 0 AND expert_id = ${expert_id} ) AS combined_counts;
                    `;
        let response = await qb.query(query);
        console.log(query);
        qb.release();

        return response;
    },

    get_user_id_by_email: async (email) => {
        let qb = await pool.get_connection();
        let response = await qb
            .select("id")
            .where({ email: email })
            .get(config.table_prefix + "users");
        qb.release();

        if (response[0]) {
            return response[0]?.id;
        } else {
            return "";
        }
    },

    check_if_email_exist: async (email, table) => {
        let qb = await pool.get_connection();
        let response = await qb
            .select("id")
            .where({ email: email })
            .get(config.table_prefix + table);
        qb.release();

        if (response.length > 0) {
            return true;
        } else {
            return false;
        }
    },

    get_data_list: async (selection, dbtable, condition) => {
        let qb = await pool.get_connection();
        let response = await qb
            .select(selection)
            .where(condition)
            .get(config.table_prefix + dbtable);
        console.log(qb.last_query());
        qb.release();
        return response;
    },

    get_like_data: async (search, dbtable) => {
        let qb = await pool.get_connection();
        let final_cond = " where ";
        if (Object.keys(search).length) {
            let like_search_str = await helpers.get_conditional_or_like_string(
                search
            );
            if (final_cond == " where ") {
                final_cond = final_cond + like_search_str;
            } else {
                final_cond = final_cond + " and " + like_search_str;
            }
        }

        if (final_cond == " where ") {
            final_cond = "";
        }

        let query =
            "select * from " +
            config.table_prefix +
            dbtable +
            final_cond +
            " ORDER BY id DESC";
        console.log(query);
        let response = await qb.query(query);
        qb.release();
        return response;
    },

    calculateAge: async (dateOfBirth) => {
        const dob = new Date(dateOfBirth);
        const now = new Date();
        const yearDiff = now.getFullYear() - dob.getFullYear();
        const monthDiff = now.getMonth() - dob.getMonth();
        const dayDiff = now.getDate() - dob.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            return yearDiff - 1;
        } else {
            return yearDiff;
        }
    },

    getUserLoginInfo: async (req) => {
        const userAgent = useragent.parse(req.headers["user-agent"]);
        const ip = requestIp.getClientIp(req);
        try {
            const response = await axios.get(
                `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.GEO_LOCATION_API}&ip=${ip}`
            );
            const { country_name: country } = response.data;
            return {
                deviceName: userAgent.device,
                browser: userAgent.browser,
                ip,
                country,
            };
        } catch (error) {
            console.error("Error fetching IP geolocation:", error);
        }
    },

    saveUserLoginInfo: async (userId, userInfo) => {
        console.log("userInfo", userInfo);
        let qb = await pool.get_connection();
        try {
            let data = {
                user_id: userId,
                device_name: userInfo?.deviceName,
                ip_address: userInfo?.ip,
                country: userInfo?.country,
                browser: userInfo?.browser,
            };
            let response = await qb
                .returning("id")
                .insert(config.table_prefix + "login_history", data);
            qb.release();
            console.log("login data recorded");
            return response;
        } catch (error) {
            console.error("Error saving user info:", error);
        }
    },

    checkExistence: async (table, field, value) => {
        const result = await helpers.get_data_list("*", table, {
            [field]: value,
        });
        return result.length > 0;
    },

    delete_common_entry: async (condition, dbtable) => {
        const qb = await pool.get_connection();
        const response = await qb.delete(
            config.table_prefix + dbtable,
            condition
        );
        qb.release();
        console.log(qb.last_query());
        return response;
    },

    generateOtp: async (size) => {
        const zeros = "0".repeat(size - 1);
        const x = parseFloat("1" + zeros);
        const y = parseFloat("9" + zeros);
        const confirmationCode = String(Math.floor(x + Math.random() * y));
        return confirmationCode;
    },

    common_count: async (condition, date_condition, search, dbtable) => {
        let qb = await pool.get_connection();
        let final_cond = " where ";

        if (Object.keys(condition).length) {
            let condition_str = await helpers.get_and_conditional_string(
                condition
            );
            if (final_cond == " where ") {
                final_cond = final_cond + condition_str;
            } else {
                final_cond = final_cond + " and " + condition_str;
            }
        }

        if (Object.keys(date_condition).length) {
            let date_condition_str = await helpers.get_date_between_condition(
                date_condition.from_date,
                date_condition.to_date,
                "created_at"
            );
            if (final_cond == " where ") {
                final_cond = final_cond + date_condition_str;
            } else {
                final_cond = final_cond + " and " + date_condition_str;
            }
        }

        if (Object.keys(search).length) {
            let date_like_search_str =
                await helpers.get_conditional_or_like_string(search);
            if (final_cond == " where ") {
                final_cond = final_cond + date_like_search_str;
            } else {
                final_cond = final_cond + " and " + date_like_search_str;
            }
        }

        if (final_cond == " where ") {
            final_cond = "";
        }

        let query =
            "select count(*) as total from " +
            config.table_prefix +
            dbtable +
            final_cond;

        console.log("query => ", query);
        let response = await qb.query(query);
        qb.release();
        return response[0]?.total;
    },

    get_avg_rating: async (review_to) => {
        let qb = await pool.get_connection();
        let query = `SELECT review_to, COALESCE(AVG(rating), 0) AS average_rating FROM mx_reviews WHERE review_to = ${review_to} GROUP BY review_to;`;
        let response = await qb.query(query);
        qb.release();
        return response;
    },

    common_add: async (data, table) => {
        let qb = await pool.get_connection();
        let response = await qb
            .returning("id")
            .insert(config.table_prefix + table, data);
        qb.release();
        return response;
    },

    common_updateDetails: async (condition, data, table) => {
        let qb = await pool.get_connection();
        let response = await qb
            .set(data)
            .where(condition)
            .update(config.table_prefix + table);
        qb.release();
        return response;
    },

    make_sequential_no: async (pre) => {
        let qb = await pool.get_connection();
        let response = "";
        switch (pre) {
            case "JOB":
                response = await qb
                    .select("job_no")
                    .order_by("id", "desc")
                    .limit(1)
                    .get(config.table_prefix + "jobs");
                break;
            case "USR":
                response = await qb
                    .select("user_no")
                    .order_by("id", "desc")
                    .limit(1)
                    .get(config.table_prefix + "users");
                break;
            case "MREXPERT":
                response = await qb
                    .select("referral_code")
                    .order_by("id", "desc")
                    .limit(1)
                    .get(config.table_prefix + "users");
                break;
            case "SRV":
                response = await qb
                    .select("service_no")
                    .order_by("id", "desc")
                    .limit(1)
                    .get(config.table_prefix + "services");
                break;
        }
        qb.release();
        let numberPart = 1001;
        if (response[0]?.job_no) {
            numberPart = parseInt(response[0].job_no.match(/\d+/)[0]) + 1;
        }
        if (response[0]?.user_no) {
            numberPart = parseInt(response[0].user_no.match(/\d+/)[0]) + 1;
        }
        if (response[0]?.referral_code) {
            numberPart =
                parseInt(response[0].referral_code.match(/\d+/)[0]) + 1;
        }
        if (response[0]?.service_no) {
            numberPart = parseInt(response[0].service_no.match(/\d+/)[0]) + 1;
        }

        return numberPart;
    },

    common_select_list: async (
        condition,
        date_condition,
        limit,
        table,
        search
    ) => {
        let dbtable = config.table_prefix + table;
        let qb = await pool.get_connection();
        let final_cond = " where ";

        if (Object.keys(condition).length) {
            let condition_str = await helpers.get_and_conditional_string(
                condition
            );
            if (final_cond == " where ") {
                final_cond = final_cond + condition_str;
            } else {
                final_cond = final_cond + " and " + condition_str;
            }
        }

        if (Object.keys(date_condition).length) {
            let date_condition_str = await helpers.get_date_between_condition(
                date_condition.from_date,
                date_condition.to_date,
                "created_at"
            );
            if (final_cond == " where ") {
                final_cond = final_cond + date_condition_str;
            } else {
                final_cond = final_cond + " and " + date_condition_str;
            }
        }

        if (Object.keys(search).length) {
            let date_like_search_str =
                await helpers.get_conditional_or_like_string(search);
            if (final_cond == " where ") {
                final_cond = final_cond + date_like_search_str;
            } else {
                final_cond = final_cond + " and " + date_like_search_str;
            }
        }

        if (final_cond == " where ") {
            final_cond = "";
        }

        let query;
        if (Object.keys(limit).length) {
            query =
                "select * from " +
                dbtable +
                final_cond +
                " ORDER BY id DESC LIMIT " +
                limit.perpage +
                " OFFSET " +
                limit.start;
        } else {
            query =
                "select * from " + dbtable + final_cond + " ORDER BY id DESC";
        }

        console.log("query => ", query);
        let response = await qb.query(query);
        qb.release();
        return response;
    },

    make_order_number: async (pre) => {
        let today = new Date();
        let day = today.getDate();
        let month = today.getMonth();
        let year = today.getFullYear();
        let str = pre;
        str +=
            randomString(2, 1) +
            month +
            randomString(3, 1) +
            day +
            randomString(2, 1);
        return str;
    },

    make_referral_code: async (pre) => {
        let today = new Date();
        let day = today.getDate();
        let month = today.getMonth();
        let year = today.getFullYear();
        let str = pre;
        str +=
            randomString(2, 1) +
            month +
            randomString(3, 1) +
            day +
            randomString(2, 1);
        return str;
    },

    get_and_conditional_string: async (obj) => {
        var output_string = "";
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                output_string += "and " + key + " = '" + obj[key] + "' ";
            }
        }

        let words = output_string.split(" ");
        let output_string1 = words.slice(1).join(" ");

        return output_string1;
    },

    get_or_conditional_string: async (obj) => {
        var output_string = "";
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                output_string += "or " + key + " = '" + obj[key] + "' ";
            }
        }

        let words = output_string.split(" ");
        let output_string1 = words.slice(1).join(" ");

        return output_string1;
    },

    get_date_between_condition: async (from_date, to_date, db_date_field) => {
        return (
            "DATE(" +
            db_date_field +
            ") BETWEEN '" +
            from_date +
            "' AND '" +
            to_date +
            "'"
        );
    },

    get_greater_than_equal_string: async (obj) => {
        var output_string = "";
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                output_string += "and " + key + " >= '" + obj[key] + "' ";
            }
        }

        let words = output_string.split(" ");
        let output_string1 = words.slice(1).join(" ");

        return output_string1;
    },

    get_less_than_equal_string: async (obj) => {
        var output_string = "";
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                output_string += "and " + key + " <= '" + obj[key] + "' ";
            }
        }

        let words = output_string.split(" ");
        let output_string1 = words.slice(1).join(" ");

        return output_string1;
    },

    get_conditional_and_like_string: async (obj) => {
        var output_string = "";
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                output_string += " and " + key + " LIKE '%" + obj[key] + "%'";
            }
        }

        let words = output_string.split(" ");
        let output_string1 = words.slice(0).join(" ");
        return output_string1;
    },

    get_conditional_or_like_string: async (obj) => {
        var output_string = "";
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                output_string += "or " + key + " LIKE '%" + obj[key] + "%' ";
            }
        }

        let words = output_string.split(" ");
        let output_string1 = words.slice(1).join(" ");
        return output_string1;
    },

    get_referrer_name_by_id: async (id) => {
        let qb = await pool.get_connection();
        let response = await qb
            .select("full_name")
            .where({ id: id })
            .get(config.table_prefix + "referrers");
        qb.release();

        if (response[0]) {
            return response[0].full_name;
        } else {
            return "";
        }
    },

    // pushNotification: async (
    //     gcmid,
    //     title,
    //     message,
    //     url_,
    //     type,
    //     payload,
    //     user
    // ) => {
    //     let apiKey = "OTk2NjE4OWItOWJhOC00MTNhLWJlYTktMDczOWQyZTBjN2I0";
    //     let url = "https://onesignal.com/api/v1/notifications";

    //     let content = { en: message };
    //     let headings = { en: title };

    //     let fields = JSON.stringify({
    //         include_player_ids: [gcmid],
    //         app_id: "4ca5a703-bb3d-4504-9a04-14df43d69cde",
    //         body: message,
    //         headings: headings,
    //         contents: content,
    //         title: title,
    //         small_icon: "",
    //         large_icon: "",
    //         content_available: true,
    //         data: {
    //             title: title,
    //             message: message,
    //             type: type,
    //             payload: payload,
    //         },
    //     });

    //     function makeRequest(res_data, p_url, apiKey) {
    //         try {
    //             const config = {
    //                 method: "post",
    //                 data: res_data,
    //                 url: p_url,
    //                 headers: {
    //                     Authorization: "Basic " + apiKey,
    //                     "Content-Type": "application/json",
    //                 },
    //             };

    //             let res = axios(config);
    //             console.log(res);
    //             return res.data;
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }
    //     makeRequest(fields, url, apiKey);
    // },

    // pushNotificationtesting: async (
    //     gcmid = "6d422d5d-2dbf-4d44-a21d-6a3eb3594a31",
    //     title = "testing-title",
    //     message = "testing message",
    //     url_ = "testing url",
    //     type = "testing type",
    //     payload = { abc: "payload object" },
    //     user = "test user"
    // ) => {
    //     let apiKey = "MGRhMzM5N2YtNWFkYS00NjgxLTk2OTQtMDBiZjMyNTgzM2Nj";
    //     url = "https://onesignal.com/api/v1/notifications";

    //     let content = { en: message };
    //     let headings = { en: title };

    //     let fields = JSON.stringify({
    //         include_player_ids: [gcmid],
    //         app_id: "3fcfcc5c-70f4-4645-8035-1b71a790e4ce",
    //         body: message,
    //         headings: headings,
    //         contents: content,
    //         title: "title",
    //         small_icon: "",
    //         large_icon: "",
    //         content_available: true,
    //         data: {
    //             title: title,
    //             message: message,
    //             type: type,
    //             payload: payload,
    //         },
    //     });

    //     function makeRequest(res_data, p_url, apiKey) {
    //         try {
    //             const config = {
    //                 method: "post",
    //                 data: res_data,
    //                 url: p_url,
    //                 headers: {
    //                     Authorization: "Basic " + apiKey,
    //                     "Content-Type": "application/json",
    //                 },
    //             };

    //             let res = axios(config);

    //             return res.data;
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }
    //     makeRequest(fields, url, apiKey);
    // },
};
module.exports = helpers;
