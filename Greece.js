const data = [
    { letter: "α", reading: "アルファ", meaning: "角度や係数に使う" },
    { letter: "β", reading: "ベータ", meaning: "ベータ粒子や係数に使う" },
    { letter: "γ", reading: "ガンマ", meaning: "ガンマ線や比率に使う" },
    { letter: "δ", reading: "デルタ", meaning: "変化量を表す" },
    { letter: "ε", reading: "イプシロン", meaning: "誤差や微小量に使う" },
    { letter: "θ", reading: "シータ", meaning: "角度に使う" },
    { letter: "λ", reading: "ラムダ", meaning: "波長や固有値に使う" },
    { letter: "μ", reading: "ミュー", meaning: "摩擦係数や平均に使う" },
    { letter: "π", reading: "パイ", meaning: "円周率" },
    { letter: "σ", reading: "シグマ", meaning: "標準偏差や総和に使う" },
  ];
  
  let currentIndex = 0;
  
  const letterEl = document.getElementById("letter");
  const readingEl = document.getElementById("reading");
  const meaningEl = document.getElementById("meaning");
  const resultEl = document.getElementById("result");
  const checkBtn = document.getElementById("checkBtn");
  const nextBtn = document.getElementById("nextBtn");
  
  function shuffleArray(arr) {
    return arr
      .map((v) => ({ v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ v }) => v);
  }
  
  function populateOptions() {
    readingEl.innerHTML = "";
    const readings = data.map((d) => d.reading);
    const shuffledReadings = shuffleArray(readings);
    readingEl.innerHTML = `<option value="">-- 選択してください --</option>`;
    shuffledReadings.forEach((r) => {
      const option = document.createElement("option");
      option.value = r;
      option.textContent = r;
      readingEl.appendChild(option);
    });
  
    meaningEl.innerHTML = "";
    const meanings = data.map((d) => d.meaning);
    const shuffledMeanings = shuffleArray(meanings);
    meaningEl.innerHTML = `<option value="">-- 選択してください --</option>`;
    shuffledMeanings.forEach((m) => {
      const option = document.createElement("option");
      option.value = m;
      option.textContent = m;
      meaningEl.appendChild(option);
    });
  }
  
  function loadQuestion() {
    const current = data[currentIndex];
    letterEl.textContent = current.letter;
    resultEl.textContent = "";
    checkBtn.style.display = "inline-block";
    nextBtn.style.display = "none";
  
    populateOptions();
  
    readingEl.value = "";
    meaningEl.value = "";
  }
  
  checkBtn.addEventListener("click", () => {
    const current = data[currentIndex];
    const selectedReading = readingEl.value;
    const selectedMeaning = meaningEl.value;
  
    if (!selectedReading || !selectedMeaning) {
      alert("読み方と意味の両方を選んでください。");
      return;
    }
  
    if (selectedReading === current.reading && selectedMeaning === current.meaning) {
      resultEl.style.color = "green";
      resultEl.textContent = "正解！🎉";
    } else {
      resultEl.style.color = "red";
      resultEl.textContent = `不正解… 正解は「${current.reading}」と「${current.meaning}」です。`;
    }
  
    checkBtn.style.display = "none";
    nextBtn.style.display = "inline-block";
  });
  
  nextBtn.addEventListener("click", () => {
    currentIndex++;
    if (currentIndex >= data.length) {
      alert("お疲れ様でした！全問終了です。");
      currentIndex = 0;
    }
    loadQuestion();
  });
  
  loadQuestion();
  
