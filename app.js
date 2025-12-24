const audio = document.getElementById('main-audio');
const playBtn = document.getElementById('play-pause');
const surahListUI = document.getElementById('surah-list');
const quranDisplay = document.getElementById('quran-display');
const welcomeArea = document.getElementById('welcome-area');
const seekSlider = document.getElementById('seek-slider');

let allSurahs = [];

async function init() {
  const res = await fetch('https://api.alquran.cloud/v1/surah');
  const data = await res.json();
  allSurahs = data.data;
  renderList(allSurahs);
}

function renderList(list) {
  surahListUI.innerHTML = list.map(s => `
    <li onclick="loadSurah(${s.number}, '${s.name}')">
      ${s.number}. ${s.name}
    </li>
  `).join('');
}

async function loadSurah(id, name) {
  welcomeArea.style.display = 'none';
  document.getElementById('active-surah-name').innerText = "سورة " + name;
  quranDisplay.innerHTML = 'جاري التحميل...';

  const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`);
  const data = await res.json();

  quranDisplay.innerHTML = `
    <div class="quran-text-flow">
      ${data.data.ayahs.map(a => `
        <span>${a.text}<span class="ayah-num">${a.numberInSurah}</span></span>
      `).join(' ')}
    </div>
  `;

  audio.src = `https://server8.mp3quran.net/afs/${String(id).padStart(3,'0')}.mp3`;
  audio.play();
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

playBtn.onclick = () => {
  if (audio.paused) {
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    audio.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
};

audio.ontimeupdate = () => {
  seekSlider.value = (audio.currentTime / audio.duration) * 100 || 0;
  document.getElementById('current-time').innerText =
    Math.floor(audio.currentTime / 60) + ':' +
    String(Math.floor(audio.currentTime % 60)).padStart(2,'0');
};

seekSlider.oninput = () => {
  audio.currentTime = (seekSlider.value / 100) * audio.duration;
};

document.getElementById('surah-search').oninput = e => {
  renderList(allSurahs.filter(s => s.name.includes(e.target.value)));
};

init();
