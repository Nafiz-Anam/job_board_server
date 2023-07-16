const path = require("path");
require("dotenv").config({ path: "../.env" });
const sk = process.env.SECRET;
const CryptoJS = require("crypto-js");

var protector = {
    encrypt: (nor_text) => {
        nor_text = nor_text.toString();
        let c_encrypted = CryptoJS.AES.encrypt(nor_text, sk).toString();
        return c_encrypted;
    },

    decrypt: (cipher_text) => {
        let bytes = CryptoJS.AES.decrypt(cipher_text, sk);
        let originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    },
};

module.exports = protector;
