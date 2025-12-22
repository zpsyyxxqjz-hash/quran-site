const surahList = document.getElementById('surah-list');
const quranArea = document.getElementById('quran-text-area');
const audioPlayer = document.getElementById('audio-player');
const reciterSelect = document.getElementById('reciter-select');
const themeToggle = document.getElementById('theme-toggle');
const lastRead = document.getElementById('last-read-status');

let fullQuran = null;

/* تحميل قائمة السور */
async function loadSurahList() {
    try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const { data } = await res.json();
        surahList.innerHTML = '';

        data.forEach(s => {
            const li = document.createElement('li');
            li.textContent = `${s.number}. ${s.name}`;
            li.addEventListener('click', () => loadSurah(s.number, s.name));
            surahList.appendChild(li);
        });
    } catch {
        surahList.innerHTML = '<li>فشل تحميل السور</li>';
    }
}

/* تحميل المصحف كامل (مرة واحدة فقط) */
async function loadFullQuran() {
    const res = await fetch('https://api.alquran.cloud/v1/quran/ar.uthmani');
    const json = await res.json();
    fullQuran = json.data.surahs;
}

/* تحميل سورة */
async function loadSurah(id, name) {
    quranArea.innerHTML = `<p>جاري تحميل سورة ${name}...</p>`;
    lastRead.textContent = `آخر ما قرأت: ${name}`;

    try {
        if (!fullQuran) await loadFullQuran();

        const surah = fullQuran.find(s => s.number === id);
        if (!surah) throw new Error();

        const fragment = document.createDocumentFragment();

        const title = document.createElement('h1');
        title.textContent = name;
        fragment.appendChild(title);

        surah.ayahs.forEach(a => {
            const span = document.createElement('span');
            span.className = 'ayah';
            span.innerHTML = `${a.text} <span class="ayah-num">﴿${a.numberInSurah}﴾</span>`;
            fragment.appendChild(span);
        });

        quranArea.innerHTML = '';
        quranArea.appendChild(fragment);

        playAudioWithFallback(id);

        localStorage.setItem('lastSurah', JSON.stringify({ id, name }));

    } catch {
        quranArea.innerHTML = '<p>تعذر عرض السورة</p>';
    }
}

/* تشغيل الصوت مع قارئ احتياطي */
function playAudioWithFallback(surahId) {
    const primary = reciterSelect.value;
    const fallback = 'ar.minshawi';

    audioPlayer.src = `https://cdn.islamic.network/quran/audio-surah/128/${primary}/${surahId}.mp3`;
    audioPlayer.load();

    audioPlayer.onerror = () => {
        audioPlayer.src = `https://cdn.islamic.network/quran/audio-surah/128/${fallback}/${surahId}.mp3`;
        audioPlayer.load();
    };
}

/* الوضع الليلي */
themeToggle.onclick = () => {
    document.body.classList.toggle('dark');
};

/* بدء التطبيق */
window.addEventListener('DOMContentLoaded', () => {
    loadSurahList();

    const saved = JSON.parse(localStorage.getItem('lastSurah'));
    if (saved) {
        lastRead.textContent = `آخر ما قرأت: ${saved.name}`;
    }
});