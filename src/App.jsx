import { useMemo, useState } from "react";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1CLbEkMD0mO2D6yuYHYg-RyiI2URPNa1OEKVvd82GcCw/edit?gid=1362179551#gid=1362179551";

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

const languageText = {
  ko: {
    title: "AI 맞춤 추천 무인 자판기",
    navKiosk: "키오스크",
    navOperator: "관리자 콘솔",
    navDev: "개발 페이지",
    langButton: "EN",
    heroTitle: "상태를 선택하면 추천 상품이 즉시 바뀝니다",
    heroLead: "사용자의 선택값을 추천 엔진 입력값으로 보고, 상품 ID, 슬롯, 카트리지 정보를 함께 갱신합니다.",
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
    navOperator: "Admin",
    navDev: "Dev",
    langButton: "KO",
    heroTitle: "Recommendations update as the user selects a need",
    heroLead:
      "The selected need is treated as recommendation input, then product ID, slot, and cartridge data are refreshed together.",
    dispense: "Dispense recommended item",
    needLabels: {
      fatigue: "High fatigue",
      focus: "Need focus",
      hydration: "Hydration",
      snack: "Light snack",
    },
  },
};

const initialLogs = [
  {
    time: "14:22",
    product: "비타민 에너지 드링크",
    slot: "A-03",
    status: "토출 완료",
    result: "샘플 데이터",
    type: "success",
  },
  {
    time: "14:05",
    product: "프로틴 바",
    slot: "B-01",
    status: "재고 부족",
    result: "샘플 데이터",
    type: "warning",
  },
];

function getKstTimestamp() {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  return new Date(Date.now() + kstOffsetMs).toISOString().replace("Z", "+09:00");
}

function makePayload(item) {
  return {
    device_id: "VND-A01",
    selected_need: item.needLabel,
    product_name: item.productName,
    product_id: item.productId,
    slot: item.slot,
    cartridge: item.cartridge,
    quantity: item.quantity,
    dispense_status: "success",
    created_at: getKstTimestamp(),
  };
}

function StatusDot({ type }) {
  return <span className={`status-dot ${type}`} />;
}

export default function App() {
  const [view, setView] = useState("kiosk");
  const [need, setNeed] = useState("fatigue");
  const [language, setLanguage] = useState("ko");
  const [status, setStatus] = useState({
    dot: "standby",
    label: "사용자 확인 대기",
    body: "비타민 에너지 드링크 토출을 진행할 수 있습니다.",
  });
  const [logs, setLogs] = useState(initialLogs);
  const [metrics, setMetrics] = useState({ total: 38, success: 36, fail: 2 });
  const [dispensing, setDispensing] = useState(false);
  const [buttonLabel, setButtonLabel] = useState(null);
  const [copyLabel, setCopyLabel] = useState("링크 복사");

  const text = languageText[language];
  const item = recommendations[need];
  const recommendationJson = useMemo(
    () => ({
      selectedNeed: text.needLabels[need],
      productId: item.productId,
      productName: item.productName,
      slot: item.slot,
      cartridge: item.cartridge,
      quantity: item.quantity,
      reason: item.reason,
    }),
    [item, need, text],
  );

  const openView = (nextView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectNeed = (nextNeed) => {
    const nextItem = recommendations[nextNeed];
    setNeed(nextNeed);
    setStatus({
      dot: "standby",
      label: "사용자 확인 대기",
      body: `${nextItem.productName} 토출을 진행할 수 있습니다.`,
    });
    if (!dispensing) {
      setButtonLabel(null);
    }
  };

  const runDispenseFlow = () => {
    if (dispensing) return;
    setDispensing(true);
    setButtonLabel("토출 진행 중");
    setStatus({
      dot: "standby",
      label: "토출 명령 전송 중",
      body: `슬롯 ${item.slot}, 카트리지 ${item.cartridge}번에 토출 명령을 전송합니다.`,
    });

    window.setTimeout(() => {
      setStatus({
        dot: "standby",
        label: "토출 완료 상태 확인",
        body: "하드웨어 응답값을 확인하고 성공 시 로그 저장 단계로 이동합니다.",
      });
    }, 800);

    window.setTimeout(() => {
      const payload = makePayload(item);
      const time = new Date(payload.created_at).toLocaleTimeString("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
      });

      setStatus({
        dot: "success",
        label: "토출 완료 및 로그 처리 완료",
        body: "관리자 콘솔 기록 완료",
      });
      setLogs((currentLogs) => [
        {
          time,
          product: payload.product_name,
          slot: payload.slot,
          status: "토출 완료",
          result: "관리자 콘솔 기록 완료",
          type: "success",
        },
        ...currentLogs,
      ]);
      setMetrics((currentMetrics) => ({
        ...currentMetrics,
        total: currentMetrics.total + 1,
        success: currentMetrics.success + 1,
      }));
      setDispensing(false);
      setButtonLabel("다시 토출 테스트");
    }, 1600);
  };

  const copySheetLink = async () => {
    try {
      await navigator.clipboard.writeText(SHEET_URL);
      setCopyLabel("복사 완료");
    } catch (error) {
      window.prompt("아래 링크를 복사하세요.", SHEET_URL);
      setCopyLabel("복사 안내");
    }

    window.setTimeout(() => {
      setCopyLabel("링크 복사");
    }, 1800);
  };

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Android Vending Kiosk</p>
          <h1>{text.title}</h1>
        </div>
        <nav className="top-actions" aria-label="화면 이동">
          <button className={`nav-button ${view === "kiosk" ? "active" : ""}`} onClick={() => openView("kiosk")}>
            {text.navKiosk}
          </button>
          <button className={`nav-button ${view === "operator" ? "active" : ""}`} onClick={() => openView("operator")}>
            {text.navOperator}
          </button>
          <button className={`nav-button ${view === "dev" ? "active" : ""}`} onClick={() => openView("dev")}>
            {text.navDev}
          </button>
          <button className="nav-button lang-toggle" type="button" onClick={() => setLanguage(language === "ko" ? "en" : "ko")}>
            {text.langButton}
          </button>
        </nav>
      </header>

      {view === "kiosk" && (
        <section id="kiosk" className="view active" aria-labelledby="kiosk-title">
          <div className="kiosk-frame">
            <aside className="step-panel">
              <p className="panel-label">사용자 흐름</p>
              <ol className="step-list">
                <li className="current">상태 선택</li>
                <li>AI 추천 결과</li>
                <li>사용자 확인</li>
                <li>제품 토출</li>
                <li>로그 저장</li>
              </ol>
              <div className="device-status">
                <StatusDot type="online" />
                Android 태블릿 연결됨
              </div>
              <div className="device-status">
                <StatusDot type="standby" />
                토출 모듈 대기 중
              </div>
              <div className="kiosk-mode-card">
                <span>Android Kiosk Mode</span>
                <ul>
                  <li>앱 단독 실행</li>
                  <li>화면 꺼짐 방지</li>
                  <li>자동 복구</li>
                </ul>
              </div>
            </aside>

            <div className="kiosk-screen">
              <section className="hero-flow">
                <div>
                  <p className="eyebrow">Step 01</p>
                  <h2 id="kiosk-title">{text.heroTitle}</h2>
                  <p className="lead">{text.heroLead}</p>
                </div>
                <div className="hero-tools">
                  <div className="clock-card">
                    <span>기기</span>
                    <strong>VND-A01</strong>
                  </div>
                </div>
              </section>

              <section className="input-grid" aria-label="사용자 입력">
                {Object.keys(recommendations).map((key) => (
                  <button key={key} className={`choice ${need === key ? "selected" : ""}`} onClick={() => selectNeed(key)}>
                    {text.needLabels[key]}
                  </button>
                ))}
              </section>

              <section className="recommendation-card">
                <div className="product-visual">
                  <div className={`product-can ${need}`} />
                </div>
                <div className="recommendation-copy">
                  <p className="eyebrow">AI 추천 결과 JSON</p>
                  <h3>{item.productName}</h3>
                  <p>
                    추천 상품 ID <strong>{item.productId}</strong>, 슬롯 <strong>{item.slot}</strong>, 카트리지{" "}
                    <strong>{item.cartridge}번</strong>으로 매핑되었습니다.
                  </p>
                  <pre>{JSON.stringify(recommendationJson, null, 2)}</pre>
                </div>
              </section>

              <div className="kiosk-actions">
                <button className="primary-button" disabled={dispensing} onClick={runDispenseFlow}>
                  {buttonLabel || text.dispense}
                </button>
              </div>

              <section className="dispense-status" aria-live="polite">
                <div className="status-row">
                  <StatusDot type={status.dot} />
                  <strong>{status.label}</strong>
                </div>
                <p>{status.body}</p>
              </section>
            </div>
          </div>
        </section>
      )}

      {view === "operator" && (
        <section id="operator" className="view active" aria-labelledby="operator-title">
          <div className="dashboard-layout">
            <section className="section-head">
              <p className="eyebrow">Admin Console</p>
              <h2 id="operator-title">관리자 콘솔</h2>
              <p className="lead">토출 이력, 추천 로그, 재고 및 카트리지 상태를 확인하는 관리자 페이지입니다.</p>
            </section>

            <div className="metric-grid">
              <article className="metric-card">
                <span>오늘 토출</span>
                <strong>{metrics.total}건</strong>
                <p>
                  성공 {metrics.success} / 실패 {metrics.fail}
                </p>
              </article>
              <article className="metric-card">
                <span>로그 시트</span>
                <strong>링크 연결</strong>
                <p>Google Sheets</p>
              </article>
              <article className="metric-card">
                <span>재고 경고</span>
                <strong>2개</strong>
                <p>A-03, B-01 보충 필요</p>
              </article>
            </div>

            <section className="sheet-link-panel" aria-labelledby="sheet-link-title">
              <div>
                <span>Google Sheets 로그</span>
                <h3 id="sheet-link-title">토출 로그 시트</h3>
                <p>토출 로그를 확인하는 공유용 스프레드시트입니다.</p>
              </div>
              <a className="sheet-link" href={SHEET_URL} target="_blank" rel="noopener noreferrer">
                docs.google.com/spreadsheets/d/1CLbEkMD...
              </a>
              <button className="secondary-button" type="button" onClick={copySheetLink}>
                {copyLabel}
              </button>
            </section>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>시간</th>
                    <th>상품</th>
                    <th>슬롯</th>
                    <th>상태</th>
                    <th>저장 결과</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={`${log.time}-${log.slot}-${index}`}>
                      <td>{log.time}</td>
                      <td>{log.product}</td>
                      <td>{log.slot}</td>
                      <td>
                        <span className={`pill ${log.type}`}>{log.status}</span>
                      </td>
                      <td>{log.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {view === "dev" && (
        <section id="dev" className="view active" aria-labelledby="dev-title">
          <div className="dashboard-layout">
            <section className="section-head">
              <p className="eyebrow">Development Page</p>
              <h2 id="dev-title">개발 작업 리스트</h2>
            </section>

            <div className="worklist">
              <WorkCard
                index="01"
                title="선택별 추천 변경"
                state="done"
                items={["피로감, 집중, 수분, 간식 선택에 따라 추천 상품 변경", "상품명, 상품 ID, 슬롯, 카트리지 JSON 갱신", "토출 대상도 현재 추천값 기준으로 변경"]}
              />
              <WorkCard
                index="02"
                title="토출 플로우"
                state="done"
                items={["사용자 확인 대기", "하드웨어 명령 전송 시뮬레이션", "토출 완료 상태 체크", "로그 저장 단계 표시"]}
              />
              <WorkCard
                index="03"
                title="Supabase 연동"
                state="disabled"
                items={["현재 저장 방식에서는 비활성화", "운영 로그 저장은 Google Sheets 기준으로 진행", "URL, key 등 설정값은 화면에 표시하지 않음"]}
              />
              <WorkCard
                index="04"
                title="Google Sheets 연동"
                state="done"
                items={["토출 로그 시트 링크 표시", "시트 바로 열기 및 링크 복사 제공", "관리자 콘솔에서 화면 로그 확인"]}
              />
              <WorkCard
                index="05"
                title="실기기 하드웨어 연동"
                state="pending"
                items={["시리얼, USB, 블루투스, 로컬 API 중 실제 통신 방식 확정 필요", "토출 완료 응답 코드와 오류 코드 정의 필요", "실제 자판기 1대 테스트 필요"]}
              />
              <WorkCard
                index="06"
                title="Android Kiosk Mode"
                state="pending"
                items={["앱 단독 실행 모드", "화면 꺼짐 방지 및 자동 복구", "뒤로가기 제한 및 앱 이탈 방지"]}
              />
            </div>

            <div className="dev-actions">
              <button className="primary-button" onClick={() => openView("kiosk")}>
                키오스크 화면으로 이동
              </button>
              <button className="secondary-button" onClick={() => openView("operator")}>
                관리자 콘솔 보기
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function WorkCard({ index, title, state, items }) {
  return (
    <article className={`work-card ${state}`}>
      <span className="work-index">{index}</span>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
