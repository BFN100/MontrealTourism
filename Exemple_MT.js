var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var mysql = require('mysql');
var page;
var page2;
var activitiesList;
var hotelList;
var roomList;


http.createServer(function(req, res) {
    var form = new formidable.IncomingForm();

    if ((req.url == '/mtData') && (page != undefined)) {
        form.parse(req, function(err, fields, files) {
            var con = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "root",
                database: "mtdb1",
                multipleStatements: true
            });
            con.connect(function(err) {
                if (err) throw err;
                console.log("Connected");

                var sql = "SET AUTOCOMMIT = OFF ;";
                sql += "INSERT INTO visitors (fam_name, giv_name, sex, num_perso, num_days, hotel_type, room_type) VALUES (?, ?, ?, ?, ?, ?, ?) ;";
                activitiesList.forEach(ligne => {
                    if (fields["c_" + ligne.id_act]) { //colocar name aqui
                        sql += "INSERT INTO enrollments(id_v, id_act) VALUES (LAST_INSERT_ID(), '" + ligne.id_act + "') ;"
                    }
                });
                sql += "COMMIT ;"

                // con.query(sql, function (err, result) {
                con.query(sql, [fields.fam_name, fields.giv_name, fields.sex, fields.num_perso, fields.num_days, fields.hotel_type, fields.room_type], function(err, result) {
                    if (err) throw err;
                    con.end(function(err) {
                        if (err) {
                            return console.log('error:' + err.message);
                        }
                        console.log('Database connection closed.');
                        console.log(fields.fam_name + ' ' + fields.giv_name + ' ' + fields.sex + ' ' + fields.num_perso + ' ' + fields.num_days + ' ' + fields.hotel_type + ' ' + fields.room_type + ' data saved');
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.write(page);
                        res.write(page2);
                        res.write('<script> document.getElementById("rp").innerHTML = "Data successfully saved  at <br> "+Date(); </script>');
                        res.end();
                    });
                });
            });
        });
    }


    if ((req.url == '/') || (page == undefined)) {
        fs.readFile("MontrealTourism.html", function(err, data) {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                return res.end("404 Not Found");
            }
            page = data;
            page2 = '<script> ';
            var con1 = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "root",
                database: "mtdb1"
            });
            con1.connect(function(err) {
                if (err) throw err;
                console.log("Connected");

                // ler os dados hotel
                sql = "SELECT * FROM hotel";
                con1.query(sql, function(err, result, _fields) {
                    if (err) throw err;
                    console.log(result);
                    hotelList = result;
                });

                // ler os dados quartos
                sql = "SELECT * FROM room";
                con1.query(sql, function(err, result, _fields) {
                    if (err) throw err;
                    console.log(result);
                    roomList = result;
                });

                // ler os dados atividades
                sql = "SELECT * FROM activities";
                con1.query(sql, function(err, result, _fields) {
                    if (err) throw err;
                    console.log(result);
                    activitiesList = result;
                });

                con1.end(function(err) {
                    if (err) {
                        return console.log('error:' + err.message);
                    }

                    hotelList.forEach(ligne => { page2 += ' add_Hotel_type("' + ligne.id_ht + '", "' + ligne.desc_ht + '"); ' });
                    roomList.forEach(ligne => { page2 += ' add_Room_type("' + ligne.id_rt + '", "' + ligne.desc_rt + '"); ' });
                    activitiesList.forEach(ligne => { page2 += ' add_Activity("' + ligne.id_act + '", "' + ligne.desc_act + '", "' + ligne.price + '"); ' });
                    page2 += ' </script>';
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    res.write(page2);
                    return res.end();
                });

                sql = "SET AUTOCOMMIT = OFF ;";
                sql += "COMMIT ;"
            });
        });
    }

    if (req.url == '/css/reset.css') {
        fs.readFile("css/reset.css", function(err, data) {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/css' });
                return res.end("404 Not Found");
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.write(data);
            return res.end();
        });
    }

    if (req.url == '/css/mt.css') {
        fs.readFile("css/mt.css", function(err, data) {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/css' });
                return res.end("404 Not Found");
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.write(data);
            return res.end();
        });
    }

}).listen(8080);