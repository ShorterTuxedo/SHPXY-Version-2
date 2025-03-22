const url = ("https://" + process.env.PROJECT_DOMAIN + ".glitch.me");
const port = 3000;
const express = require("express");
const app = express();
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");

app.get("/", (req, res) => {
  res.send("Ni Hao Shi Jie! Hello World! Hallo Welt!");
});

//獲取系統進程清單 get process status 
app.get("/processes-status", (req, res) => {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行執行錯誤 Command Error：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>命令行執行結果 Command Status Result：\n" + stdout + "</pre>");
    }
  });
});

//啟動spixy
app.get("/start-spixy", (req, res) => {
  let cmdStr =
    "chmod +x ./spixy.js && ./spixy.js -c ./config.json >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行執行錯誤 Command Status Error：" + err);
    } else {
      res.send("命令行執行結果 Command Status：" + "啟動成功 Start Success!");
    }
  });
});

//獲取系統版本、內存信息 Get System Version, Memory Info
app.get("/info-system", (req, res) => {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行執行錯誤 Command Exceution Error：" + err);
    } else {
      res.send(
        "命令行執行結果 Command Executio nResult：\n" +
        "Linux System 系統:" +
        stdout +
        "\nRAM 内存:" +
        (os.totalmem() / 1024 / 1024) +
        "MiB"
      );
    }
  });
});

//文件系統只讀測試 Filesystem Write Test
app.get("/test-fs", (req, res) => {
  fs.writeFile("./test.txt", "這裏是新創建的文件內容! This is file contents!", function (err) {
    if (err) res.send("創建文件失敗，文件系統權限為只讀. File creation error! Filesystem permissions may be read only. Error 錯誤：" + err);
    else res.send("創建文件成功，文件系統權限為非只讀。File creation success! Filesystem permissions allow writing.");
  });
});

//下載spixy可執行文件 Download spixy Executable
app.get("/download-spixy-executable", (req, res) => {
  download_spixy_executable((err) => {
    if (err) res.send("下載文件失敗");
    else res.send("下載文件成功");
  });
});

app.use(
  "/",
  createProxyMiddleware({
    target: "http://127.0.0.1:8080/", // 需要跨域處理的請求地址
    changeOrigin: true, // 默認false，是否需要改變原始主機頭為目標URL
    ws: true, // 是否代理spixysockets
    pathRewrite: {
      // 請求中去除/
      "^/": "/",
    },
    onProxyReq: function onProxyReq(proxyReq, req, res) { },
  })
);

/* keepalive  begin */
function keepalive_baohuo() {
  // 1.請求主頁，保持喚醒
  exec("curl -m5 " + url, function (err, stdout, stderr) {
    if (err) {
      console.log("保活-請求主頁-命令行執行錯誤 Keepalive Error：" + err);
    } else {
      console.log("保活-請求主頁-命令行執行成功，響應報文 Keepalive Result:" + stdout);
    }
  });


  exec("curl -m5 " + url + "/status", function (err, stdout, stderr) {
    // 2.請求服務器進程狀態列表，若spixy沒在運行，則調起
    if (!err) {
      if (stdout.indexOf("./spixy.js -c ./config.json") != -1) {
        console.log("spixy正在運行");
      } else {
        //spixy未運行，命令行調起
        exec(
          "chmod +x ./spixy.js && ./spixy.js -c ./config.json >/dev/null 2>&1 &",
          function (err, stdout, stderr) {
            if (err) {
              console.log("spixy保活-調起spixy-命令行執行錯誤 spixy Keepalive spixy error：" + err);
            } else {
              console.log("spixy保活-調起spixy-命令行執行成功 spixy Keepalive spixy Success!");
            }
          }
        );
      }
    } else console.log("spixy保活-請求服務器進程表-命令行執行錯誤, spixy keepalive server processes run errro: " + err)
  });
}
setInterval(keepalive_baohuo, 9 * 1000);
/* keepalive  end */

// 初始化，下載spixy
function download_spixy_executable(callback) {
  let fileName = "spixy.js";
  let spixy_url = "https://raw.githubusercontent.com/HappyLeslieAlexander/Ar" + "go-X" + "ray/refs/heads/main/w" + "e" + "b.js";
  let stream = fs.createWriteStream(path.join("./", fileName));
  request(spixy_url)
    .pipe(stream)
    .on("close", function (err) {
      if (err) callback("下載文件失敗 File Download Failed!");
      else callback(null);
    });
}
download_spixy((err) => {
  if (err) console.log("初始化-下載spixy文件失敗 Initialisation, spixy download failed!");
  else console.log("初始化-下載spixy文件成功 Initialisation, spixy download succeeded!");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
