const { Parser } = require("json2csv");

const sendCsv = (res, data, fields, filename) => {
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(filename);
    // \uFEFF (BOM) supaya Excel membaca karakter dengan benar
    res.status(200).send("\uFEFF" + csv);
};

module.exports = { sendCsv };