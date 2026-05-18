const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll("[data-view]");
const choiceButtons = document.querySelectorAll(".choice");
const dispenseButton = document.querySelector("#dispenseButton");
const dispenseStatus = document.querySelector("#dispenseStatus");
const productName = document.querySelector("#productName");
const productSummary = document.querySelector("#productSummary");
const recommendationJson = document.querySelector("#recommendationJson");
const productVisual = document.querySelector("#productVisual");
const logRows = document.querySelector("#logRows");
const integrationState = document.querySelector("#integrationState");
const dispenseCount = document.querySelector("#dispenseCount");
const successCount = document.querySelector("#successCount");
const saveIntegration = document.querySelector("#saveIntegration");
const languageToggle = document.querySelector("#languageToggle");

const integrationInputs = {
  sheetWebhookUrl: document.querySelector("#sheetWebhookUrl"),
};

const recommendations = {
  fatigue: {
    needLabel: "피로감 높음",
    productName: "비타민 에너지 드링크",
    productId: "SKU-ENERGY-02",
    slot: "A-03",
    cartridge: 2,
    quantity: 1,
    reason: "피로감 선택값에 맞춰 카페인과 비타민 보충 상품을 추천합니다.",
  },
  focus: {
    needLabel: "집중 필요",
    productName: "콜드브루 집중 부스터",
    productId: "SKU-FOCUS-01",
    slot: "B-02",
    cartridge: 4,
    quantity: 1,
    reason: "집중 필요 선택값에 맞춰 카페인 기반 음료를 추천합니다.",
  },
  hydration: {
    needLabel: "수분 보충",
    productName: "이온 밸런스 워터",
    productId: "SKU-HYDRATION-04",
    slot: "C-01",
    cartridge: 1,
    quantity: 1,
    reason: "수분 보충 선택값에 맞춰 전해질 음료를 추천합니다.",
  },
  snack: {
    needLabel: "가벼운 간식",
    productName: "프로틴 너트 바",
    productId: "SKU-SNACK-03",
    slot: "D-04",
    cartridge: 6,
    quantity: 1,
    reason: "가벼운 간식 선택값에 맞춰 포만감 있는 스낵을 추천합니다.",
  },
};

let currentNeed = "fatigue";
let currentLanguage = "ko";
let dispenseTotal = 38;
let dispenseSuccess = 36;
let dispenseFail = 2;

const languageText = {
  ko: {
    title: "AI 맞춤 추천 무인 자판기",
    navKiosk: "키오스크",
    navOperator: "운영자",
    navDev: "개발 페이지",
    langButton: "EN",
    heroTitle: "상태를 선택하면 추천 상품이 즉시 바뀝니다",
    heroLead: "사용자의 선택값을 추천 엔진 입력값으로 보고, 상품 ID, 슬롯, 카트리지 정보를 함께 갱신합니다.",
    devSmall: "개발 작업 보기",
    dispense: "추천 상품 토출하기",
    needLabels: {
      fatigue: "피로감 높음",
      focus: "집중 필요",
      hydration: "수분 보충",
      snack: "가벼운 간식",
    },
  },
  en: {
    title: "AI Personalized Vending Kiosk",
    navKiosk: "Kiosk",
    navOperator: "Operator",
    navDev: "Dev",
    langButton: "KO",
    heroTitle: "Recommendations update as the user selects a need",
    heroLead: "The selected need is treated as recommendation input, then product ID, slot, and cartridge data are refreshed together.",
    devSmall: "Dev tasks",
    dispense: "Dispense recommended item",
    needLabels: {
      fatigue: "High fatigue",
      focus: "Need focus",
      hydration: "Hydration",
      snack: "Light snack",
    },
  },
};

function showView(viewId) {
  views.forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getCurrentRecommendation() {
  return recommendations[currentNeed];
}

function getKstTimestamp() {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  return new Date(Date.now() + kstOffsetMs).toISOString().replace("Z", "+09:00");
}

function makePayload(status = "success") {
  const item = getCurrentRecommendation();
  return {
    device_id: "VND-A01",
    selected_need: item.needLabel,
    product_name: item.productName,
    product_id: item.productId,
    slot: item.slot,
    cartridge: item.cartridge,
    quantity: item.quantity,
    dispense_status: status,
    created_at: getKstTimestamp(),
  };
}

function renderRecommendation() {
  const item = getCurrentRecommendation();
  const text = languageText[currentLanguage];
  const json = {
    selectedNeed: text.needLabels[currentNeed],
    productId: item.productId,
    productName: item.productName,
    slot: item.slot,
    cartridge: item.cartridge,
    quantity: item.quantity,
    reason: item.reason,
  };

  productName.textContent = item.productName;
  productSummary.innerHTML = `
    추천 상품 ID <strong>${item.productId}</strong>, 슬롯 <strong>${item.slot}</strong>,
    카트리지 <strong>${item.cartridge}번</strong>으로 매핑되었습니다.
  `;
  recommendationJson.textContent = JSON.stringify(json, null, 2);
  productVisual.className = `product-can ${currentNeed}`;
  renderStatus("standby", "사용자 확인 대기", `${item.productName} 토출을 진행할 수 있습니다.`);
}

function renderLanguage() {
  const text = languageText[currentLanguage];
  document.querySelector("h1").textContent = text.title;
  document.querySelector('[data-view="kiosk"].nav-button').textContent = text.navKiosk;
  document.querySelector('[data-view="operator"].nav-button').textContent = text.navOperator;
  document.querySelector('[data-view="dev"].nav-button').textContent = text.navDev;
  languageToggle.textContent = text.langButton;
  document.querySelector("#kiosk-title").textContent = text.heroTitle;
  document.querySelector(".hero-flow .lead").textContent = text.heroLead;
  document.querySelector(".tiny-link-button").textContent = text.devSmall;
  dispenseButton.textContent = text.dispense;
  choiceButtons.forEach((button) => {
    button.textContent = text.needLabels[button.dataset.need];
  });
  renderRecommendation();
}

function renderStatus(dot, label, body) {
  dispenseStatus.innerHTML = `
    <div class="status-row">
      <span class="status-dot ${dot}"></span>
      <strong>${label}</strong>
    </div>
    <p>${body}</p>
  `;
}

function getIntegrationConfig() {
  return {
    sheetWebhookUrl: localStorage.getItem("sheetWebhookUrl") || "",
  };
}

function restoreIntegrationConfig() {
  const config = getIntegrationConfig();
  integrationInputs.sheetWebhookUrl.value = config.sheetWebhookUrl;
  updateIntegrationState();
}

function updateIntegrationState() {
  const config = getIntegrationConfig();
  const sheetReady = Boolean(config.sheetWebhookUrl);

  integrationState.textContent = sheetReady ? "Google Sheets 연결" : "설정 필요";
}

async function sendToGoogleSheets(payload) {
  const config = getIntegrationConfig();
  if (!config.sheetWebhookUrl) {
    return "Google Sheets 설정 필요";
  }

  const response = await fetch(config.sheetWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Google Sheets ${response.status}`);
  }

  return "Google Sheets 저장 성공";
}

async function sendLogs(payload) {
  return sendToGoogleSheets(payload);
}

function addLogRow(payload, saveResult) {
  const time = new Date(payload.created_at).toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
  });
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${time}</td>
    <td>${payload.product_name}</td>
    <td>${payload.slot}</td>
    <td><span class="pill success">토출 완료</span></td>
    <td>${saveResult}</td>
  `;
  logRows.prepend(row);
}

function updateMetrics() {
  dispenseCount.textContent = `${dispenseTotal}건`;
  successCount.textContent = `성공 ${dispenseSuccess} / 실패 ${dispenseFail}`;
}

async function runDispenseFlow() {
  const item = getCurrentRecommendation();
  dispenseButton.disabled = true;
  dispenseButton.textContent = "토출 진행 중";

  renderStatus("standby", "토출 명령 전송 중", `슬롯 ${item.slot}, 카트리지 ${item.cartridge}번에 토출 명령을 전송합니다.`);

  window.setTimeout(() => {
    renderStatus("standby", "토출 완료 상태 확인", "하드웨어 응답값을 확인하고 성공 시 로그 저장 단계로 이동합니다.");
  }, 800);

  window.setTimeout(async () => {
    const payload = makePayload("success");
    renderStatus("standby", "Google Sheets 저장 중", "토출 이력과 추천 로그를 Google Sheets로 전송합니다.");

    let saveResult = "";
    try {
      saveResult = await sendLogs(payload);
      renderStatus("success", "토출 완료 및 로그 처리 완료", saveResult);
    } catch (error) {
      saveResult = error.message;
      renderStatus("error", "토출 완료 / 로그 저장 확인 필요", saveResult);
    }

    dispenseTotal += 1;
    dispenseSuccess += 1;
    updateMetrics();
    addLogRow(payload, saveResult);
    dispenseButton.disabled = false;
    dispenseButton.textContent = "다시 토출 테스트";
  }, 1600);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    choiceButtons.forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    currentNeed = button.dataset.need;
    renderRecommendation();
  });
});

saveIntegration.addEventListener("click", () => {
  Object.entries(integrationInputs).forEach(([key, input]) => {
    localStorage.setItem(key, input.value.trim());
  });
  updateIntegrationState();
  renderStatus("success", "연동 설정 저장 완료", "다음 토출부터 Google Sheets 전송을 시도합니다.");
});

languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "ko" ? "en" : "ko";
  renderLanguage();
});

dispenseButton.addEventListener("click", runDispenseFlow);

restoreIntegrationConfig();
renderLanguage();
updateMetrics();
