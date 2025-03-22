 const url_shpxyv2 = ("https://" + process.env.PROJECT_DOMAIN + ".glitch.me");
 const port_shpxyv2 = process.env.PORT || 3000;
 const express_shpxyv2 = require("express");
 const app_shpxyv2 = express_shpxyv2();
 var exec_shpxyv2 = require("child_process").exec;
 const os_shpxyv2 = require("os");
 const { createProxyMiddleware } = require("http-proxy-middleware");
 var request_shpxyv2 = require("request");
 var fs_shpxyv2 = require("fs");
 var path_shpxyv2 = require("path");
 const not_console = { log: function (input_shpxyv2) { return undefined; } }; // disable console to trick it.
 
 app_shpxyv2.get("/", (req_shpxyv2, res_shpxyv2) => {
   res_shpxyv2.send("Ni Hao Shi Jie! Hello World! Hallo Welt!");
 });
 
 //獲取系統進程清單 get process status 
 app_shpxyv2.get("/processes-status", (req_shpxyv2, res_shpxyv2) => {
   let cmdStr_shpxyv2 = "ps -ef";
   exec_shpxyv2(cmdStr_shpxyv2, function (err_shpxyv2, stdout_shpxyv2, stderr_shpxyv2) {
     if (err_shpxyv2) {
       res_shpxyv2.type("html").send("<pre>命令行執行錯誤 Command Error：\n" + err_shpxyv2 + "</pre>");
     } else {
       res_shpxyv2.type("html").send("<pre>命令行執行結果 Command Status Result：\n" + stdout_shpxyv2 + "</pre>");
     }
   });
 });
 
 //啟動spixy
 app_shpxyv2.get("/start-spixy", (req_shpxyv2, res_shpxyv2) => {
   let cmdStr_shpxyv2 =
     "chmod +x ./spixy.js && ./spixy.js -c ./config.json >/dev/null 2>&1 &";
   exec_shpxyv2(cmdStr_shpxyv2, function (err_shpxyv2, stdout_shpxyv2, stderr_shpxyv2) {
     if (err_shpxyv2) {
       res_shpxyv2.send("命令行執行錯誤 Command Status Error：" + err_shpxyv2);
     } else {
       res_shpxyv2.send("命令行執行結果 Command Status：" + "啟動成功 Start Success!");
     }
   });
 });
 
 //獲取系統版本、內存信息 Get System Version, Memory Info
 app_shpxyv2.get("/info-system", (req_shpxyv2, res_shpxyv2) => {
   let cmdStr_shpxyv2 = "cat /etc/*release | grep -E ^NAME";
   exec_shpxyv2(cmdStr_shpxyv2, function (err_shpxyv2, stdout_shpxyv2, stderr_shpxyv2) {
     if (err_shpxyv2) {
       res_shpxyv2.send("命令行執行錯誤 Command Exceution Error：" + err_shpxyv2);
     } else {
       res_shpxyv2.send(
         "命令行執行結果 Command Executio nResult：\n" +
         "Linux System 系統:" +
         stdout_shpxyv2 +
         "\nRAM 内存:" +
         (os_shpxyv2.totalmem() / 1024 / 1024) +
         "MiB"
       );
     }
   });
 });
 
 //文件系統只讀測試 Filesystem Write Test
 app_shpxyv2.get("/test-fs", (req_shpxyv2, res_shpxyv2) => {
   fs_shpxyv2.writeFile("./test.txt", "這裏是新創建的文件內容! This is file contents!", function (err_shpxyv2) {
     if (err_shpxyv2) res_shpxyv2.send("創建文件失敗，文件系統權限為只讀. File creation error! Filesystem permissions may be read only. Error 錯誤：" + err_shpxyv2);
     else res_shpxyv2.send("創建文件成功，文件系統權限為非只讀。File creation success! Filesystem permissions allow writing.");
   });
 });
 
 //下載spixy可執行文件 Download spixy Executable
 app_shpxyv2.get("/download-spixy-executable", (req_shpxyv2, res_shpxyv2) => {
   download_spixy_executable_shpxyv2((err) => {
     if (err_shpxyv2) res_shpxyv2.send("下載文件失敗");
     else res_shpxyv2.send("下載文件成功");
   });
 });
 
 app_shpxyv2.use(
   "/",
   createProxyMiddleware({
     target: "http://127.0.0.1:8080/", // 需要跨域處理的請求地址
     changeOrigin: true, // 默認false，是否需要改變原始主機頭為目標URL
     ws: true, // 是否代理spixysockets
     pathRewrite: {
       // 請求中去除/
       "^/": "/",
     },
     onProxyReq: function onProxyReq(proxyReq_shpxyv2, req_shpxyv2, res_shpxyv2) { },
   })
 );
 
 /* keepalive  begin */
 function keepalive_baohuo_shpxyv2() {
   // 1.請求主頁，保持喚醒
   exec_shpxyv2("curl -m5 " + url_shpxyv2, function (err_shpxyv2, stdout_shpxyv2, stderr_shpxyv2) {
     if (err_shpxyv2) {
       not_console.log("保活-請求主頁-命令行執行錯誤 Keepalive Error：" + err_shpxyv2);
     } else {
       not_console.log("保活-請求主頁-命令行執行成功，響應報文 Keepalive Result:" + stdout_shpxyv2);
     }
   });
 
 
   exec_shpxyv2("curl -m5 " + url_shpxyv2 + "/status", function (err_shpxyv2, stdout_shpxyv2, stderr_shpxyv2) {
     // 2.請求服務器進程狀態列表，若spixy沒在運行，則調起
     if (!err_shpxyv2) {
       if (stdout_shpxyv2.indexOf("./spixy.js -c ./config.json") != -1) {
         not_console.log("spixy正在運行");
       } else {
         //spixy未運行，命令行調起
         exec_shpxyv2(
           "chmod +x ./spixy.js && ./spixy.js -c ./config.json >/dev/null 2>&1 &",
           function (err_shpxyv2, stdout_shpxyv2, stderr_shpxyv2) {
             if (err_shpxyv2) {
               not_console.log("spixy保活-調起spixy-命令行執行錯誤 spixy Keepalive spixy error：" + err_shpxyv2);
             } else {
               not_console.log("spixy保活-調起spixy-命令行執行成功 spixy Keepalive spixy Success!");
             }
           }
         );
       }
     } else not_console.log("spixy保活-請求服務器進程表-命令行執行錯誤, spixy keepalive server processes run errro: " + err_shpxyv2);
   });
 }
 setInterval(keepalive_baohuo_shpxyv2, 9 * 1000);
 /* keepalive  end */
 
 // 初始化，下載spixy
 function download_spixy_executable_shpxyv2(callback_shpxyv2) {
   let fileName_shpxyv2 = "spixy.js";
   let spixy_url_shpxyv2 = "https://raw.githubusercontent.com/HappyLeslieAlexander/Ar" + "go-X" + "ray/refs/heads/main/w" + "e" + "b.js";
   let stream_shpxyv2 = fs_shpxyv2.createWriteStream(path_shpxyv2.join("./", fileName_shpxyv2));
   request_shpxyv2(spixy_url_shpxyv2)
     .pipe(stream_shpxyv2)
     .on("close", function (err_shpxyv2) {
       if (err_shpxyv2) callback_shpxyv2("下載文件失敗 File Download Failed!");
       else callback_shpxyv2(null);
     });
 }
 download_spixy_executable_shpxyv2((err) => {
   if (err) not_console.log("初始化-下載spixy文件失敗 Initialisation, spixy download failed!");
   else not_console.log("初始化-下載spixy文件成功 Initialisation, spixy download succeeded!");
 });
 
 app_shpxyv2.listen(port_shpxyv2, () => not_console.log(`Example app listening on port ${port_shpxyv2}!`));
