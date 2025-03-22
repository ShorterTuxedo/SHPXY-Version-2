const url = ("https://" + process.env.PROJECT_DOMAIN + ".glitch.me");
const port = 3000;
const nezha = "aintnonezha.org 5555 nezhanezhanezha";
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

//啟動web
app.get("/start-web", (req, res) => {
  let cmdStr =
    "chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行執行錯誤 Command Status Error：" + err);
    } else {
      res.send("命令行執行結果 Command Status：" + "啟動成功 Start Success!");
    }
  });
});

//啟動哪吒
app.get("/nezha-controller", (req, res) => {
  let cmdStr = "/bin/bash nezha.sh " + nezha + " >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("哪吒和敖丙客戶端部署錯誤 Nezha Controller Deploy Error：" + err);
    } else {
      res.send("哪吒和敖丙客戶端執行結果 Nezha Controller Run Result：" + "啟動成功 Start Success!");
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

//下載web可執行文件 Download Web Executable
app.get("/download-web-executable", (req, res) => {
  download_web_executable((err) => {
    if (err) res.send("下載文件失敗");
    else res.send("下載文件成功");
  });
});

app.use(
  "/",
  createProxyMiddleware({
    target: "http://127.0.0.1:8080/", // 需要跨域處理的請求地址
    changeOrigin: true, // 默認false，是否需要改變原始主機頭為目標URL
    ws: true, // 是否代理websockets
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
    // 2.請求服務器進程狀態列表，若web沒在運行，則調起
    if (!err) {
      if (stdout.indexOf("./web.js -c ./config.json") != -1) {
        console.log("web正在運行");
      } else {
        //web未運行，命令行調起
        exec(
          "chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &",
          function (err, stdout, stderr) {
            if (err) {
              console.log("web保活-調起web-命令行執行錯誤 Web Keepalive web error：" + err);
            } else {
              console.log("web保活-調起web-命令行執行成功 Web Keepalive Web Success!");
            }
          }
        );
      }
    } else console.log("web保活-請求服務器進程表-命令行執行錯誤, Web keepalive server processes run errro: " + err);

    // 3.請求服務器進程狀態列表，若哪吒和敖丙沒在運行，則調起
    if (!err) {
      if (stdout.indexOf("nezha-agent") != -1) {
        console.log("哪吒和敖丙正在運行 Nezha is running");
      } else {
        //哪吒和敖丙未運行，命令行調起
        exec(
          "/bin/bash nezha.sh " + nezha + " >/dev/null 2>&1 &",
          function (err, stdout, stderr) {
            if (err) {
              console.log("哪吒和敖丙保活-調起web-命令行執行錯誤：" + err);
            } else {
              console.log("哪吒和敖丙保活-調起web-命令行執行成功!");
            }
          }
        );
      }
    } else console.log("哪吒和敖丙保活 NeZha keepalive-請求服務器進程表-命令行執行錯誤 Error grabbing server processes: " + err);
  });
}
setInterval(keepalive_baohuo, 9 * 1000);
/* keepalive  end */

// 初始化，下載web
function download_web_executable(callback) {
  let fileName = "web.js";
  let web_url = "https://cdn.glitch.me/53b1a4c6-ff7f-4b62-99b4-444ceaa6c0cd/web?v=1673588495643";
  let stream = fs.createWriteStream(path.join("./", fileName));
  request(web_url)
    .pipe(stream)
    .on("close", function (err) {
      if (err) callback("下載文件失敗 File Download Fialed!");
      else callback(null);
    });
}
download_web((err) => {
  if (err) console.log("初始化-下載web文件失敗 Initialisation, web download failed!");
  else console.log("初始化-下載web文件成功 Initialisation, web download succeeded!");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
