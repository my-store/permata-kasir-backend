const data = {
    tlp: "082324380852",
    password: "123",
    app_name: "Permata-Kasir-Client-RestAPI",
};

const str_data = JSON.stringify(data);

// Hasil Enkripsi
const reversed_str = str_data.split("").reverse().join("");
const b64 = Buffer.from(reversed_str).toString("base64");
const hex = Buffer.from(b64).toString("hex");

// Hasi dekripsi
const dec_hex = Buffer.from(hex, "hex").toString();
const dec_b64 = Buffer.from(dec_hex, "base64").toString();
const reversed_b64 = dec_b64.split("").reverse().join("");

console.log("Hasil Enkripsi:");
console.log(hex);

console.log("-".repeat(30));

console.log("Hasil Dekripsi");
console.log(reversed_b64);
