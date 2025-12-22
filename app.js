const surahList = document.getElementById('surah-list');
const quranArea = document.getElementById('quran-text-area');
const audioPlayer = document.getElementById('audio-player');
const reciterSelect = document.getElementById('reciter-select');
const themeToggle = document.getElementById('theme-toggle');
const lastRead = document.getElementById('last-read-status');

let fullQuran = null;

// تحميل قائمة السور
async function loadSurahList() {
    try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        if (!res.ok) throw new Error('Network response was not ok');
        const json = await res.json();
        const data = json.data;
        
        surahList.innerHTML = '';
        data.forEach(s => {
            const li = document.createElement('li');
            li.textContent = `${s.number}. ${s.name}`;
            li.style.cursor = 'pointer';
            li.onclick = () => loadSurah(s.number, s.name);
            surahList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading surahs:', error);
        surahList.innerHTML = '<li>فشل تحميل السور. تأكد من اتصالك بالإنترنت</li>';
    }
}

// تحميل سورة محددة
async function loadSurah(id, name) {
    quranArea.innerHTML = `<p>جاري تحميل سورة ${name}...</p>`;
    lastRead.textContent = `آخر ما قرأت: ${name}`;

    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.uthmani`);
        const json = await res.json();
        const surah = json.data;

        const fragment = document.createDocumentFragment();
        const title = document.createElement('h1');
        title.textContent = name;
        fragment.appendChild(title);

        surah.ayahs.forEach(a => {
            const span = document.createElement('span');
            span.className = 'ayah';
            span.innerHTML = `${a.text} <span class="ayah-num">﴿${a.numberInSurah}﴾</span> `;
            fragment.appendChild(span);
        });

        quranArea.innerHTML = '';
        quranArea.appendChild(fragment);
        playAudioWithFallback(id);
        localStorage.setItem('lastSurah', JSON.stringify({ id, name }));

    } catch (error) {
        quranArea.innerHTML = '<p>تعذر عرض السورة. حاول مرة أخرى.</p>';
    }
}

function playAudioWithFallback(surahId) {
    const primary = reciterSelect.value;
    audioPlayer.src = `https://cdn.islamic.network/quran/audio-surah/128/${primary}/${surahId}.mp3`;
    audioPlayer.load();
}

themeToggle.onclick = () => {
    document.body.classList.toggle('dark');
};

window.addEventListener('DOMContentLoaded', () => {
    loadSurahList();
    const saved = JSON.parse(localStorage.getItem('lastSurah'));
    if (saved) {
        lastRead.textContent = `آخر ما قرأت: ${saved.name}`;
    }
});
