(function () {
  const TRACKS = [
    { title: "Nailong Wave 01", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { title: "Nailong Wave 08", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
    { title: "Nailong Wave 11", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
    { title: "Nailong Wave 16", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" }
  ];

  let idx = 0;
  let hidden = false;
  let audio = document.getElementById("ntAudio");
  if (!audio) {
    audio = document.createElement("audio");
    audio.id = "ntAudio";
    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";
    document.body.appendChild(audio);
  }

  function load(i, auto) {
    idx = (i + TRACKS.length) % TRACKS.length;
    audio.src = TRACKS[idx].src;
    updateUI();
    if (auto) audio.play().catch(() => {});
  }

  function updateUI() {
    const title = document.getElementById("ntMusicTitle");
    const play = document.getElementById("ntPlay");
    const wrap = document.getElementById("ntMusic");
    if (title) title.textContent = TRACKS[idx].title;
    if (play) play.innerHTML = audio.paused
      ? '<i class="fa-solid fa-play"></i>'
      : '<i class="fa-solid fa-pause"></i>';
    if (wrap) wrap.classList.toggle("off", hidden);
    wrap && wrap.classList.toggle("playing", !audio.paused);
  }

  audio.addEventListener("ended", () => load(idx + 1, true));
  audio.addEventListener("play", updateUI);
  audio.addEventListener("pause", updateUI);

  window.NTMusic = {
    tracks: TRACKS,
    bind() {
      const play = document.getElementById("ntPlay");
      const next = document.getElementById("ntNext");
      const prev = document.getElementById("ntPrev");
      const mute = document.getElementById("ntMute");
      const close = document.getElementById("ntClose");
      if (!audio.src) load(0, false);
      if (play) play.onclick = (e) => {
        e.stopPropagation();
        if (audio.paused) audio.play().catch(() => {});
        else audio.pause();
      };
      if (next) next.onclick = (e) => { e.stopPropagation(); load(idx + 1, true); };
      if (prev) prev.onclick = (e) => { e.stopPropagation(); load(idx - 1, true); };
      if (mute) mute.onclick = (e) => {
        e.stopPropagation();
        audio.muted = !audio.muted;
        mute.innerHTML = audio.muted
          ? '<i class="fa-solid fa-volume-xmark"></i>'
          : '<i class="fa-solid fa-volume-high"></i>';
      };
      if (close) close.onclick = (e) => {
        e.stopPropagation();
        hidden = true;
        audio.pause();
        updateUI();
      };
      updateUI();
    },
    widget() {
      if (hidden) {
        return `<button class="nt-music-mini" id="ntMusicShow" type="button" title="Musik"><i class="fa-solid fa-music"></i></button>`;
      }
      return `<div class="nt-music" id="ntMusic">
        <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="nt-music-meta">
          <small>NAILONG FM</small>
          <b id="ntMusicTitle">${TRACKS[idx].title}</b>
        </div>
        <button type="button" id="ntMute" title="Volume"><i class="fa-solid fa-volume-high"></i></button>
        <button type="button" id="ntPrev" title="Sebelumnya"><i class="fa-solid fa-backward-step"></i></button>
        <button type="button" id="ntPlay" title="Play"><i class="fa-solid fa-play"></i></button>
        <button type="button" id="ntNext" title="Berikutnya"><i class="fa-solid fa-forward-step"></i></button>
        <button type="button" id="ntClose" title="Tutup"><i class="fa-solid fa-xmark"></i></button>
      </div>`;
    },
    showAgain() { hidden = false; }
  };
})();
