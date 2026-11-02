const 天干 = '甲乙丙丁戊己庚辛壬癸';
const 地支 = '子丑寅卯辰巳午未申酉戌亥';
const 五行 = ['木','木','火','火','土','土','金','金','水','水'];
const 星座 = ['摩羯座','水瓶座','雙魚座','牡羊座','金牛座','雙子座','巨蟹座','獅子座','處女座','天秤座','天蠍座','射手座','摩羯座'];
const 星座界日 = [20,19,21,20,21,22,23,23,23,24,23,22];
const 解讀 = {木:'象徵生長與開展。可以留意自己如何學習、規劃，以及在彈性與堅持之間取得平衡。',火:'象徵熱情與表達。可以觀察自己如何展現想法，也記得為生活安排休息與充電的空間。',土:'象徵承載與穩定。可以思考自己如何建立安全感，以及面對變化時保留多少彈性。',金:'象徵條理與判斷。可以留意自己如何設定界線、整理優先順序，並適時接受不同觀點。',水:'象徵流動與思考。可以觀察自己如何適應環境、整理感受，並將想法化為行動。'};
const 取餘 = (數字, 範圍) => ((數字 % 範圍) + 範圍) % 範圍;
// 太陽黃經的近似公式，用來估計立春及各月節氣的交界。
function 太陽黃經(時間) {
  const 儒略日 = 時間 / 86400000 + 2440587.5;
  const 世紀 = (儒略日 - 2451545) / 36525;
  const 平黃經 = 280.46646 + 36000.76983 * 世紀 + 0.0003032 * 世紀 * 世紀;
  const 平近點角 = (357.52911 + 35999.05029 * 世紀 - 0.0001537 * 世紀 * 世紀) * Math.PI / 180;
  return 取餘(平黃經 + (1.914602 - 0.004817 * 世紀) * Math.sin(平近點角) + 0.019993 * Math.sin(2 * 平近點角) + 0.000289 * Math.sin(3 * 平近點角) - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * 世紀) * Math.PI / 180), 360);
}
function 四柱(年, 月, 日, 時, 分) {
  // 表單輸入為台灣標準時間，換算成世界時間後估算太陽黃經。
  const 時刻 = Date.UTC(年, 月 - 1, 日, 時 - 8, 分);
  const 黃經 = 太陽黃經(時刻);
  const 命理年 = 年 - ((月 === 1 || (月 === 2 && 黃經 < 315)) ? 1 : 0);
  const 年序 = 取餘(命理年 - 1984, 60);
  const 月序 = Math.floor(取餘(黃經 - 315, 360) / 30);
  const 月干 = 取餘((年序 % 10 % 5) * 2 + 2 + 月序, 10);
  const 月支 = 取餘(2 + 月序, 12);
  // 以 2000 年 1 月 7 日為甲子日，採每日零時換日。
  const 天數 = Math.round((Date.UTC(年, 月 - 1, 日) - Date.UTC(2000, 0, 7)) / 86400000);
  const 日序 = 取餘(天數, 60);
  const 時支 = Math.floor((時 + 1) / 2) % 12;
  const 時干 = 取餘((日序 % 10 % 5) * 2 + 時支, 10);
  return {柱:[天干[年序 % 10]+地支[年序 % 12],天干[月干]+地支[月支],天干[日序 % 10]+地支[日序 % 12],天干[時干]+地支[時支]],日干:天干[日序 % 10],元素:五行[日序 % 10],黃經};
}
const 表單 = document.getElementById('birth-form');
表單.addEventListener('submit', function (事件) {
  事件.preventDefault();
  const [年, 月, 日] = document.getElementById('date').value.split('-').map(Number);
  const [時, 分] = document.getElementById('time').value.split(':').map(Number);
  if (!年 || 年 < 1901 || 年 > 2099 || !Number.isInteger(時)) return;
  const 稱呼 = document.getElementById('name').value.trim() || '你';
  const 命盤 = 四柱(年,月,日,時,分);
  const 星名 = 星座[月 - (日 < 星座界日[月 - 1] ? 1 : 0)];
  const 距節氣 = Math.min(取餘(命盤.黃經 - 315, 30), 30 - 取餘(命盤.黃經 - 315, 30));
  const 結果 = document.getElementById('result');
  // 稱呼先轉成純文字，避免把輸入內容當成網頁程式執行。
  const 安全稱呼 = document.createElement('span'); 安全稱呼.textContent = 稱呼;
  結果.innerHTML = `<div class="result-header"><span class="small">你的專屬命盤</span><h3>${安全稱呼.innerHTML}的命盤小誌</h3><p>${年} 年 ${月} 月 ${日} 日 · ${String(時).padStart(2,'0')}:${String(分).padStart(2,'0')} · 台灣標準時間</p></div><div class="pillars">${命盤.柱.map((柱,序)=>`<div class="pillar"><span>${['年柱','月柱','日柱','時柱'][序]}</span><strong>${柱}</strong></div>`).join('')}</div><div class="readings"><div class="reading"><h4>✳ 日主 · ${命盤.日干}${命盤.元素}</h4><p>日主取自日柱天干，在傳統八字中代表觀察命盤的核心。${解讀[命盤.元素]}</p></div><div class="reading"><h4>✧ 太陽星座 · ${星名}</h4><p>太陽星座以生日的常見日期區間估算，代表西洋占星中自我意識的象徵；交界日期可能因出生年份與時間有所不同。</p></div></div><p class="result-note">計算方式：立春換年、節氣換月、每日零時換日，未校正真太陽時。${距節氣 < 1 ? '你的出生時間接近節氣交界，年柱或月柱可能因計算誤差而不同，請另行核對。' : ''}${時 === 23 ? '你出生於子時；部分流派採晚子時換日，日柱與時柱可能不同。' : ''}</p>`;
  結果.scrollIntoView({behavior:'smooth',block:'nearest'});
});
