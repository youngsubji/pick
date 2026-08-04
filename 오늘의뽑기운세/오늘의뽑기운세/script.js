/* =========================================================
   오늘의뽑기운세 — script.js
   카드 뽑기 게임 로직 + 맞춤형 운세 생성 엔진
   - 서버/DB 없음, 모든 데이터는 메모리(변수)에서만 처리
   - 입력값은 localStorage 등에 저장하지 않음
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
   * 1. 운세 데이터
   * --------------------------------------------------------- */

  // 기본 운세 20종 (등급 + 오늘의 한마디). 등급 비중: 대길3 / 길4 / 소길4 / 평운4 / 주의5
  const FORTUNES = [
    { grade: "대길", title: "새로운 기회가 찾아오는 날", message: "평소 관심 있던 일에 도전하면 좋은 결과를 기대할 수 있습니다. 먼저 움직이는 사람이 기회를 잡습니다." },
    { grade: "대길", title: "기분 좋은 소식이 들려오는 날", message: "기다리던 연락이나 반가운 소식을 받을 가능성이 있습니다. 긍정적인 마음으로 하루를 시작해 보세요." },
    { grade: "대길", title: "당신의 능력이 빛나는 날", message: "집중력과 판단력이 좋아지는 하루입니다. 중요한 업무나 결정을 처리하기에 좋습니다." },
    { grade: "길", title: "작은 행운이 이어지는 날", message: "큰 변화보다는 사소한 기쁨이 쌓이는 하루입니다. 주변의 작은 친절을 놓치지 마세요." },
    { grade: "길", title: "사람을 통해 기회가 생기는 날", message: "가벼운 대화 속에서 유용한 정보나 아이디어를 얻을 수 있습니다. 먼저 인사를 건네보세요." },
    { grade: "길", title: "노력한 만큼 결과가 보이는 날", message: "미뤄두었던 일을 마무리하면 만족스러운 결과를 얻을 수 있습니다. 꾸준함이 행운을 부릅니다." },
    { grade: "길", title: "관계가 한층 가까워지는 날", message: "솔직하고 따뜻한 표현이 좋은 분위기를 만듭니다. 감사의 마음을 전해 보세요." },
    { grade: "소길", title: "차분하게 진행하면 좋은 날", message: "서두르지 않고 순서대로 처리하면 큰 어려움 없이 목표를 달성할 수 있습니다." },
    { grade: "소길", title: "익숙한 것에서 답을 찾는 날", message: "새로운 방법보다 기본에 충실한 선택이 도움이 됩니다. 과거의 경험을 활용해 보세요." },
    { grade: "소길", title: "작은 변화가 필요한 날", message: "자리 정리나 일정 변경처럼 간단한 변화가 기분 전환과 좋은 흐름을 만들어 줍니다." },
    { grade: "소길", title: "휴식이 행운이 되는 날", message: "무리하게 일정을 채우기보다 잠시 쉬어가는 것이 좋습니다. 충분한 휴식이 집중력을 높여줍니다." },
    { grade: "평운", title: "평범함 속에 안정이 있는 날", message: "특별한 변화는 없지만 계획대로 움직이면 편안한 하루를 보낼 수 있습니다." },
    { grade: "평운", title: "균형이 중요한 날", message: "일과 휴식, 지출과 절약 사이의 균형을 잘 맞추면 만족스러운 하루가 됩니다." },
    { grade: "평운", title: "주변을 살펴보면 좋은 날", message: "내 일에만 집중하기보다 주변 사람의 상황을 살펴보세요. 작은 배려가 좋은 인연을 만듭니다." },
    { grade: "평운", title: "천천히 생각하면 답이 보이는 날", message: "즉시 결정하기보다 한 번 더 검토하는 것이 좋습니다. 차분한 판단이 실수를 줄여줍니다." },
    { grade: "주의", title: "말을 한 번 더 생각해야 하는 날", message: "사소한 말이 오해로 이어질 수 있습니다. 부드럽고 명확하게 표현하면 문제를 피할 수 있습니다." },
    { grade: "주의", title: "충동적인 지출을 조심하는 날", message: "오늘은 필요한 것과 원하는 것을 구분해 보세요. 구매 전에 한 번 더 생각하는 것이 좋습니다." },
    { grade: "주의", title: "무리한 일정을 줄여야 하는 날", message: "욕심을 내기보다 중요한 일부터 처리하세요. 적절한 휴식이 오히려 효율을 높여줍니다." },
    { grade: "주의", title: "확인이 필요한 날", message: "파일, 약속 시간, 준비물을 한 번 더 점검하세요. 작은 확인만으로 실수를 충분히 예방할 수 있습니다." },
    { grade: "주의", title: "감정적인 결정을 피해야 하는 날", message: "기분이 흔들릴 때는 바로 결론을 내리지 마세요. 잠시 시간을 두면 더 좋은 판단을 할 수 있습니다." }
  ];

  // 분야별 조언 문장 (각 16개 이상)
  const CATEGORY = {
    "금전운": [
      "충동적인 지출은 한 번 더 검토하는 것이 좋습니다.",
      "필요한 물건과 갖고 싶은 물건을 구분해 보면 지출 계획이 한결 수월해집니다.",
      "작은 이익이나 예상하지 못한 혜택이 생길 수 있습니다.",
      "가계부나 지출 내역을 한 번 확인해 보면 도움이 됩니다.",
      "큰 결정보다는 오늘 쓸 예산을 먼저 점검해 보세요.",
      "정기적으로 나가는 지출을 다시 살펴보면 여유가 생길 수 있습니다.",
      "오늘은 저축이나 절약 습관을 다시 다지기 좋은 날입니다.",
      "금전과 관련된 결정은 충분한 정보를 확인한 후 판단하세요.",
      "작은 절약이 모여 만족스러운 결과로 이어질 수 있습니다.",
      "갑작스러운 지출 요청이 있다면 여유를 갖고 살펴보세요.",
      "필요한 지출과 미룰 수 있는 지출을 나눠보면 계획이 명확해집니다.",
      "오늘은 돈 관리에 신경 쓰면 마음이 한결 가벼워집니다.",
      "작은 용돈벌이나 부수입이 생길 가능성이 있습니다.",
      "지갑이나 카드 사용 내역을 점검해보면 좋은 발견이 있을 수 있습니다.",
      "계획한 예산 안에서 움직이면 만족스러운 하루가 됩니다.",
      "주변 사람과의 금전 거래는 조건을 명확히 확인하고 진행하세요."
    ],
    "연애·인간관계운": [
      "먼저 안부를 전하면 편안한 대화가 이어질 수 있습니다.",
      "가까운 사람과 대화할 때는 상대의 말을 충분히 들어보세요.",
      "작은 표현 하나가 관계를 따뜻하게 만들어줍니다.",
      "오해가 생겼다면 짧은 연락으로 풀어보는 것이 좋습니다.",
      "솔직한 마음을 전하면 관계가 한층 편안해집니다.",
      "상대의 입장을 한 번 더 헤아려보면 대화가 부드러워집니다.",
      "오늘은 먼저 다가가는 쪽이 좋은 흐름을 만듭니다.",
      "감사의 인사를 전하면 관계에 좋은 기운이 더해집니다.",
      "가벼운 만남이나 연락이 반가운 소식으로 이어질 수 있습니다.",
      "작은 배려가 상대에게 크게 다가갈 수 있는 날입니다.",
      "새로운 인연을 만날 가능성이 열려 있는 하루입니다.",
      "서운했던 감정은 담아두기보다 차분히 표현해 보세요.",
      "함께하는 시간을 소중히 여기면 관계가 더 깊어집니다.",
      "오늘은 경청하는 태도가 좋은 인상을 남깁니다.",
      "자연스러운 대화 속에서 서로를 이해하는 계기가 생깁니다.",
      "오랜만에 연락이 뜸했던 사람과 안부를 나눠보세요."
    ],
    "직장·학업운": [
      "오늘은 업무의 우선순위를 명확하게 정하는 것이 중요합니다.",
      "새로운 일을 시작하기보다 진행 중인 업무를 마무리하면 좋은 평가를 받을 수 있습니다.",
      "중요한 업무는 오전에 우선 처리해 보세요.",
      "회의나 보고가 있다면 핵심 내용을 미리 정리하는 것이 도움이 됩니다.",
      "집중력이 높아져 미뤄둔 일을 처리하기 좋습니다.",
      "계획을 세워 순서대로 진행하면 무리 없이 목표에 다가갈 수 있습니다.",
      "동료나 팀원과의 협업이 좋은 결과로 이어질 수 있습니다.",
      "작은 실수를 줄이기 위해 마무리 전 한 번 더 확인해 보세요.",
      "꾸준히 해온 노력이 좋은 평가로 돌아올 수 있습니다.",
      "새로운 아이디어를 정리해두면 나중에 유용하게 쓰입니다.",
      "서두르기보다 차분하게 단계를 밟아가는 것이 좋습니다.",
      "배움이나 공부에 집중하기 좋은 흐름입니다.",
      "어려운 과제는 작은 단위로 나눠서 접근해보세요.",
      "선생님이나 상사와의 소통에서 좋은 신호를 받을 수 있습니다.",
      "계획했던 일정을 점검하면 여유롭게 하루를 보낼 수 있습니다.",
      "시험이나 발표를 앞두고 있다면 마지막 점검에 집중해 보세요."
    ],
    "건강운": [
      "목과 어깨를 가볍게 풀어주고 충분한 수분을 섭취해 주세요.",
      "가벼운 산책과 스트레칭이 도움이 됩니다.",
      "피로가 느껴진다면 무리한 일정보다 휴식을 우선해 주세요.",
      "규칙적인 식사가 컨디션 관리에 도움이 됩니다.",
      "충분한 수면이 오늘 하루의 활력을 좌우합니다.",
      "눈이 피로하다면 잠시 화면에서 눈을 떼고 쉬어보세요.",
      "실내 환기를 자주 시켜주면 컨디션 관리에 도움이 됩니다.",
      "카페인 섭취를 조금 줄이면 몸이 한결 가벼워질 수 있습니다.",
      "짧은 스트레칭만으로도 몸의 긴장이 풀릴 수 있습니다.",
      "오늘은 무리한 운동보다 가벼운 활동이 잘 맞는 날입니다.",
      "물을 자주 마시면 컨디션 유지에 도움이 됩니다.",
      "자세를 바르게 하면 피로감이 줄어들 수 있습니다.",
      "몸이 보내는 신호에 귀 기울이며 무리하지 않도록 하세요.",
      "따뜻한 차 한 잔이 몸과 마음을 편안하게 해줍니다.",
      "짧은 낮잠이나 휴식이 오후의 집중력을 높여줍니다.",
      "컨디션이 좋지 않다면 일정을 조금 줄여보는 것도 좋습니다."
    ]
  };

  const CATEGORY_ORDER = ["금전운", "연애·인간관계운", "직장·학업운", "건강운"];

  // 기분별 행동 조언 (규칙 3 반영: 기분에 따라 표현 조절)
  const ACTION_ADVICE = {
    "default": [
      "미뤄둔 일 한 가지를 완료해 보세요.",
      "오늘 할 일 목록을 다시 한번 점검해 보세요.",
      "평소보다 조금 일찍 하루를 시작해 보세요.",
      "주변을 정리하면 마음도 한결 가벼워집니다.",
      "잠시 시간을 내어 오늘 하루를 계획해 보세요."
    ],
    "기분이 좋음": [
      "미뤄왔던 일을 오늘 과감하게 시작해 보세요.",
      "먼저 연락하거나 인사를 건네보세요.",
      "새로운 시도를 해보기 좋은 흐름입니다.",
      "오늘의 좋은 기분을 주변 사람과 나눠보세요.",
      "평소 망설였던 대화를 먼저 꺼내보세요."
    ],
    "조금 피곤함": [
      "오늘은 일정을 조금 줄이고 여유를 가져보세요.",
      "짧은 휴식을 중간중간 넣어 컨디션을 관리해 보세요.",
      "무리한 약속보다는 가벼운 하루를 계획해 보세요.",
      "우선순위가 높은 일 한 가지에만 집중해 보세요.",
      "오늘만큼은 스스로에게 조금 너그러워져 보세요."
    ],
    "고민이 있음": [
      "결정을 서두르기보다 하루 더 생각해 보는 것도 좋습니다.",
      "믿을 만한 사람에게 가볍게 의견을 물어보세요.",
      "고민을 적어보면 생각이 조금 더 정리될 수 있습니다.",
      "지금 당장 답을 내리지 않아도 괜찮습니다.",
      "산책하며 생각을 정리하는 시간을 가져보세요."
    ],
    "새로운 변화가 필요함": [
      "책상이나 방 안 작은 곳부터 정리해 보세요.",
      "평소와 다른 길로 산책을 해보는 것도 좋습니다.",
      "작은 루틴 하나를 새롭게 시작해 보세요.",
      "큰 결정보다는 사소한 변화부터 시도해 보세요.",
      "안 읽던 책이나 안 듣던 음악처럼 작은 새로움을 더해보세요."
    ]
  };

  const LUCKY_COLORS = ["하늘색", "네이비", "라벤더", "아이보리", "민트", "코랄", "베이지", "골드", "버건디", "그레이", "라일락", "올리브", "로즈", "인디고", "크림"];
  const LUCKY_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // 기분별 첫 문장 리드인 (규칙 3)
  const MOOD_LEAD = {
    "기분이 좋음": "지금의 좋은 기운을 오늘 하루 잘 살려보세요.",
    "평범함": "차분한 하루 속에서 작은 흐름을 잘 살펴보세요.",
    "조금 피곤함": "무리하지 않고 나만의 속도로 움직이면 좋은 날입니다.",
    "고민이 있음": "서두르지 않고 천천히 마음을 정리해도 괜찮습니다.",
    "새로운 변화가 필요함": "작은 변화 하나가 오늘 하루를 새롭게 만들어 줄 수 있습니다.",
    "default": "오늘 하루의 흐름을 함께 살펴볼게요."
  };

  /* ---------------------------------------------------------
   * 2. 유틸리티
   * --------------------------------------------------------- */

  // 배열에서 랜덤 n개(중복 없이) 추출
  function sample(arr, n) {
    const pool = arr.slice();
    const out = [];
    n = Math.min(n, pool.length);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return out;
  }

  function pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // 이름/일정 등 사용자 입력값에서 HTML 태그·스크립트 요소를 제거하는 안전 처리
  function sanitizeInput(raw) {
    if (!raw) return "";
    return raw
      .replace(/<[^>]*>/g, "")   // 태그 제거
      .replace(/[<>]/g, "")      // 남은 꺾쇠 제거
      .trim()
      .slice(0, 40);
  }

  // 텍스트를 DOM에 안전하게(escape) 삽입하기 위한 헬퍼
  function setText(el, text) {
    el.textContent = text;
  }

  /* ---------------------------------------------------------
   * 3. 상태
   * --------------------------------------------------------- */

  const state = {
    name: "",
    age: "",
    topic: "",     // 관심 분야
    mood: "",      // 현재 기분
    schedule: "",  // 오늘의 일정
    isFlipping: false,
    hasDrawn: false
  };

  /* ---------------------------------------------------------
   * 4. DOM 참조
   * --------------------------------------------------------- */

  const els = {
    personalizeToggle: document.getElementById("personalizeToggle"),
    personalizeForm: document.getElementById("personalizeForm"),
    inputName: document.getElementById("inputName"),
    inputAge: document.getElementById("inputAge"),
    inputSchedule: document.getElementById("inputSchedule"),
    topicGroup: document.getElementById("topicGroup"),
    moodGroup: document.getElementById("moodGroup"),
    cards: document.getElementById("cards"),
    subtitle: document.getElementById("subtitle"),
    drawHint: document.getElementById("drawHint"),
    screenDraw: document.getElementById("screen-draw"),
    screenResult: document.getElementById("screen-result"),
    resultLead: document.getElementById("resultLead"),
    gradeValue: document.getElementById("gradeValue"),
    resultSections: document.getElementById("resultSections"),
    actionAdvice: document.getElementById("actionAdvice"),
    luckyColor: document.getElementById("luckyColor"),
    luckyNumber: document.getElementById("luckyNumber"),
    redrawBtn: document.getElementById("redrawBtn")
  };

  /* ---------------------------------------------------------
   * 5. 맞춤 정보 입력 패널
   * --------------------------------------------------------- */

  els.personalizeToggle.addEventListener("click", () => {
    const expanded = els.personalizeToggle.getAttribute("aria-expanded") === "true";
    els.personalizeToggle.setAttribute("aria-expanded", String(!expanded));
    els.personalizeForm.hidden = expanded;
  });

  els.inputName.addEventListener("input", () => {
    state.name = sanitizeInput(els.inputName.value);
  });

  els.inputAge.addEventListener("change", () => {
    state.age = els.inputAge.value;
  });

  els.inputSchedule.addEventListener("input", () => {
    state.schedule = sanitizeInput(els.inputSchedule.value);
  });

  function setupChipGroup(container, key) {
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      const already = btn.classList.contains("active");
      container.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      if (already) {
        // 다시 누르면 선택 해제
        state[key] = "";
      } else {
        btn.classList.add("active");
        state[key] = btn.dataset.value;
      }
    });
  }

  setupChipGroup(els.topicGroup, "topic");
  setupChipGroup(els.moodGroup, "mood");

  /* ---------------------------------------------------------
   * 6. 카드 렌더링
   * --------------------------------------------------------- */

  const STAR_ICON = '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4l4.8 13.2L42 22l-13.2 4.8L24 40l-4.8-13.2L6 22l13.2-4.8L24 4z" stroke="#d3ab5e" stroke-width="1.4" stroke-linejoin="round"/><circle cx="24" cy="22" r="16" stroke="#8b6cf2" stroke-width="0.8" opacity="0.5"/></svg>';
  const MOON_ICON = '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30 6a18 18 0 100 36 14 14 0 010-36z" stroke="#d3ab5e" stroke-width="1.4" stroke-linejoin="round"/><circle cx="14" cy="14" r="1.4" fill="#8b6cf2"/><circle cx="10" cy="26" r="1" fill="#8b6cf2"/></svg>';
  const SPARK_ICON = '<svg class="spark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6c1.5 8 6 12.5 14 14-8 1.5-12.5 6-14 14-1.5-8-6-12.5-14-14 8-1.5 12.5-6 14-14z" fill="#f0cd85"/></svg>';

  function buildCards() {
    els.cards.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card floating";
      btn.setAttribute("aria-label", `운세 카드 ${i + 1}번 선택하기`);
      btn.dataset.index = String(i);

      const back = document.createElement("div");
      back.className = "card-face card-back";
      back.innerHTML = i % 2 === 0 ? STAR_ICON : MOON_ICON;

      const front = document.createElement("div");
      front.className = "card-face card-front";
      front.innerHTML = SPARK_ICON;

      btn.appendChild(back);
      btn.appendChild(front);
      btn.addEventListener("click", () => handleCardSelect(btn));
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardSelect(btn);
        }
      });

      els.cards.appendChild(btn);
    }
  }

  function handleCardSelect(cardEl) {
    if (state.isFlipping || state.hasDrawn) return; // 중복 실행 방지
    state.isFlipping = true;
    state.hasDrawn = true;

    const allCards = els.cards.querySelectorAll(".card");
    allCards.forEach((c) => {
      c.classList.remove("floating");
      if (c !== cardEl) c.classList.add("disabled");
    });

    cardEl.classList.add("flipped");
    setText(els.drawHint, "카드를 확인하고 있어요...");

    window.setTimeout(() => {
      renderResult();
      els.screenDraw.hidden = true;
      els.screenResult.hidden = false;
      els.screenResult.focus?.();
      state.isFlipping = false;
    }, 650);
  }

  /* ---------------------------------------------------------
   * 7. 결과 생성 & 렌더링
   * --------------------------------------------------------- */

  function renderResult() {
    const fortune = pickOne(FORTUNES);
    const color = pickOne(LUCKY_COLORS);
    const number = pickOne(LUCKY_NUMBERS);

    // 1) 첫 문장 (이름 + 기분 리드인)
    const lead = MOOD_LEAD[state.mood] || MOOD_LEAD.default;
    const leadText = state.name ? `${state.name}님, ${lead}` : lead;
    setText(els.resultLead, leadText);

    // 2) 운세 등급
    setText(els.gradeValue, fortune.grade);
    els.gradeValue.style.color =
      fortune.grade === "주의" ? "var(--danger-safe)" : "var(--gold-bright)";

    // 3) 관심 분야 상세 + 나머지 카테고리
    els.resultSections.innerHTML = "";

    let remainingCategories = CATEGORY_ORDER.slice();

    if (state.topic && state.topic !== "종합운" && CATEGORY_ORDER.includes(state.topic)) {
      // 선택한 분야를 맨 앞에 자세히 (2문장)
      appendSection(state.topic, sample(CATEGORY[state.topic], 2).join(" "), true);
      remainingCategories = remainingCategories.filter((c) => c !== state.topic);
    } else if (state.topic === "종합운") {
      appendSection("종합운", fortune.message, true);
    } else {
      // 관심 분야를 선택하지 않았다면 오늘의 한마디를 종합 안내로 사용
      appendSection("오늘의 한마디", fortune.message, true);
    }

    remainingCategories.forEach((cat) => {
      appendSection(cat, pickOne(CATEGORY[cat]));
    });

    // 일정 반영: 마지막 섹션 아래 붙여서 자연스럽게 연결
    if (state.schedule) {
      const scheduleBlock = document.createElement("div");
      scheduleBlock.className = "result-block";
      const h2 = document.createElement("h2");
      h2.className = "block-title";
      h2.textContent = "오늘의 일정 참고";
      const p = document.createElement("p");
      p.className = "block-body";
      p.textContent = `"${state.schedule}" 일정을 앞두고 있다면, 미리 한 번 더 확인하고 여유 있게 준비하면 안정적으로 마무리할 수 있습니다.`;
      scheduleBlock.appendChild(h2);
      scheduleBlock.appendChild(p);
      els.resultSections.appendChild(scheduleBlock);
    }

    // 8) 행동 조언
    const advicePool = ACTION_ADVICE[state.mood] || ACTION_ADVICE.default;
    setText(els.actionAdvice, pickOne(advicePool));

    // 9-10) 행운의 색 / 숫자
    setText(els.luckyColor, color);
    setText(els.luckyNumber, String(number));
  }

  function appendSection(title, body, primary) {
    const block = document.createElement("div");
    block.className = "result-block" + (primary ? " primary" : "");
    const h2 = document.createElement("h2");
    h2.className = "block-title";
    h2.textContent = title;
    const p = document.createElement("p");
    p.className = "block-body";
    p.textContent = body;
    block.appendChild(h2);
    block.appendChild(p);
    els.resultSections.appendChild(block);
  }

  /* ---------------------------------------------------------
   * 8. 다시 뽑기
   * --------------------------------------------------------- */

  els.redrawBtn.addEventListener("click", () => {
    state.isFlipping = false;
    state.hasDrawn = false;
    els.screenResult.hidden = true;
    els.screenDraw.hidden = false;
    setText(els.drawHint, "카드는 한 장만 선택할 수 있어요.");
    buildCards();
    els.screenDraw.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------------------------------------------------------
   * 9. 초기화
   * --------------------------------------------------------- */

  buildCards();
})();
