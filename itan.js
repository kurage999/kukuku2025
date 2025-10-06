document.getElementById('gacha-btn').addEventListener('click', function () {
  const resultElement = document.getElementById('result');

  // ガチャの確率設定
  const rand = Math.random();

  let resultText = '';
  let color = '';

  if (rand < 0.05) {
    resultText = 'SSR キャラゲット！🌟🌟🌟';
    color = '#FFD700'; // 金色
  } else if (rand < 0.25) {
    resultText = 'R キャラゲット！⭐️⭐️';
    color = '#4169E1'; // 青色
  } else {
    resultText = 'N キャラゲット！⭐️';
    color = '#808080'; // グレー
  }

  resultElement.textContent = resultText;
  resultElement.style.color = color;
});
