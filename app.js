const surahList = document.getElementById('surah-list');
const quranText = document.getElementById('quran-text');
const player = document.getElementById('player');

async function init() {
    const res = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await res.json();

    surahList.innerHTML = '';
    data.data.forEach(s => {
        const li = document.createElement('li');
        li.textContent = `${s.number}. ${s.name}`;
        li.onclick = () => loadSurah(s.number, s.name);
        surahList.appendChild(li);
    });
}

async function loadSurah(id, name) {
    quranText.innerHTML = `جاري تحميل ${name}...`;

    const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`);
    const data = await res.json();

    quranText.innerHTML = `<h1>${name}</h1>`;
    data.data.ayahs.forEach(a => {
        quranText.innerHTML += `${a.text} ﴿${a.numberInSurah}﴾ `;
    });

    player.src = `https://cdn.islamic.network/quran/audio-surah/128/ar.minshawi/${id}.mp3`;
}

window.onload = init;
