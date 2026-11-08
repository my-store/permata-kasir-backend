const data = {
    tlp: "082324380852",
    password: "123",
    app_name: "Permata-Kasir-Client-RestAPI",
};

const str_data = JSON.stringify(data);

function reverse(str) {
    return str.split("").reverse().join("");
}

// Convert to base64
const b64 = Buffer.from(str_data).toString("base64");
// Reverse the base64
const reversed_b64 = reverse(b64);

// Convert to hex
const hex = Buffer.from(reversed_b64).toString("hex");
// Reverse the hex
const reversed_hex = reverse(hex);

// Display encryption result
console.log("Final Encrypted:");
console.log(reversed_hex);

// Lines
console.log("-".repeat(50));

/*
|   -----------------------------------------
|   DECRYPTION
|   -----------------------------------------
|   1. Reverse the hex
|   2. Convert from hex to base64
|   3. Reverse the base64
|   4. Convert from base64 to utf-8
*/

const _hex = reverse(reversed_hex);
const hex_ = Buffer.from(_hex, "hex").toString();
const _b64 = reverse(hex_);
const b64_ = Buffer.from(_b64, "base64").toString();
console.log("Final Decrypted:");
console.log(b64_);

// Lines
console.log("-".repeat(50));

// Display char length/ size
console.log("Payload Size:", Buffer.byteLength(reversed_hex));
