#!/usr/bin/env bash

# 傳哪咤和敖丙三個參數
NEZHA_AOBING_SERVER=$1
NEZHA_AOBING_PORT=$2
NEZHA_AOBING_KEY=$3

# 三個變量不全則不安裝哪咤和敖丙客戶端
check_variable() {
  [[ -z "${NEZHA_AOBING_SERVER}" || -z "${NEZHA_AOBING_PORT}" || -z "${NEZHA_AOBING_KEY}" ]] && exit 0
}

# 安裝系統依賴
check_dependencies() {
  DEPS_CHECK=("wget" "unzip")
  DEPS_INSTALL=(" wget" " unzip")
  for ((i=0;i<${#DEPS_CHECK[@]};i++)); do [[ ! $(type -p ${DEPS_CHECK[i]}) ]] && DEPS+=${DEPS_INSTALL[i]}; done
  [ -n "$DEPS" ] && { apt-get update >/dev/null 2>&1; apt-get install -y $DEPS >/dev/null 2>&1; }
}

# 下載最新版本 哪咤 Aobing Agent
download_agent() {
  URL=$(wget -qO- -4 "https://api.github.com/repos/naiba/nezha/releases/latest" | grep -o "https.*linux_amd64.zip")
  wget -t 2 -T 10 -N ${URL}
  unzip -qod ./ nezha-agent_linux_amd64.zip && rm -f nezha-agent_linux_amd64.zip
}

# 運行客戶端
run() {
  ./nezha-agent -s ${NEZHA_AOBING_SERVER}:${NEZHA_AOBING_PORT} -p ${NEZHA_AOBING_KEY}
}

check_variable
check_dependencies
download_agent
run
