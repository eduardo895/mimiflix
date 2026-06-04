const VIDEO_DATA = {
  duration: "15:03",
  thumbnail: "https://pix-cdn77.phncdn.com/c6251/videos/202510/05/25025605/original/0199b3ef-3666-78ac-b452-a70c1c327309.jpg/plain/rs:fit:320:180?hash=lBr73kHdcVNi4TzHHXN_wo-4zLk=&validto=1777945403",
  title: "Threesome game for a couple looking for passion",
  url: "https://www.pornhub.com/view_video.php?viewkey=68e230c5cae8d",
  views: "130K"
};

const POLL_INTERVAL_MS = 10000;
const MAX_POLL_ATTEMPTS = 30;

const player = document.getElementById("videoPlayer");
const statusBox = document.getElementById("statusBox");
const statusText = document.getElementById("statusText");
const playerSourceLabel = document.getElementById("playerSourceLabel");
const loadVideoBtn = document.getElementById("loadVideoBtn");
const formatList = document.getElementById("formatList");
const formatsBox = document.getElementById("formatsBox");
const titleEl = document.getElementById("videoTitle");
const thumbnailEl = document.getElementById("videoThumbnail");
const durationEl = document.getElementById("videoDuration");
const viewsEl = document.getElementById("videoViews");
const sourceLinkEl = document.getElementById("sourceLink");

let hlsInstance = null;

document.title = VIDEO_DATA.title;
titleEl.textContent = VIDEO_DATA.title;
thumbnailEl.src = VIDEO_DATA.thumbnail;
thumbnailEl.alt = `Thumbnail do video ${VIDEO_DATA.title}`;
durationEl.textContent = VIDEO_DATA.duration;
viewsEl.textContent = `${VIDEO_DATA.views} visualizacoes`;
sourceLinkEl.href = VIDEO_DATA.url;

function setStatus(title, message) {
  statusBox.querySelector("strong").textContent = title;
  statusText.textContent = message;
}

function destroyHls() {
  if (!hlsInstance) return;
  hlsInstance.destroy();
  hlsInstance = null;
}

function parseHeight(format) {
  const resolution = String(format?.resolution || "");
  const id = String(format?.id || "");
  const resolutionMatch = resolution.match(/x(\d{3,4})$/i) || resolution.match(/(\d{3,4})$/i);
  if (resolutionMatch) return Number.parseInt(resolutionMatch[1], 10) || 0;
  const idMatch = id.match(/(\d{3,4})p/i);
  return idMatch ? Number.parseInt(idMatch[1], 10) || 0 : 0;
}

function chooseBestFormat(formats) {
  const directMp4 = formats
    .filter((format) => typeof format?.url === "string" && /\.mp4(\?|$)/i.test(format.url))
    .sort((left, right) => parseHeight(right) - parseHeight(left));

  if (directMp4.length) return directMp4[0];

  const hls = formats.find((format) => typeof format?.url === "string" && /\.m3u8(\?|$)/i.test(format.url));
  return hls || formats.find((format) => typeof format?.url === "string") || null;
}

function renderFormats(formats, selectedUrl) {
  if (!formats.length) {
    formatsBox.hidden = true;
    formatList.innerHTML = "";
    return;
  }

  formatsBox.hidden = false;
  formatList.innerHTML = formats.map((format) => {
    const codecParts = [format.vcodec, format.acodec].filter(Boolean).join(" / ");
    const selectedBadge = format.url === selectedUrl ? " - selecionado" : "";
    return `
      <li class="format-item">
        <div>
          <div><strong>${format.id || "stream"}${selectedBadge}</strong></div>
          <small>${format.resolution || "Resolucao desconhecida"}${codecParts ? ` - ${codecParts}` : ""}</small>
        </div>
        <a class="link-btn" href="${format.url}" target="_blank" rel="noreferrer">Abrir</a>
      </li>
    `;
  }).join("");
}

async function fetchDownloadFormats() {
  const response = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: VIDEO_DATA.url })
  });

  const data = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(data?.error || "Falha ao obter formatos.");
  }
  if (!Array.isArray(data) || !data.length) {
    throw new Error("A API nao devolveu formatos para este video.");
  }
  return data;
}

async function waitUntilReady(streamUrl) {
  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt += 1) {
    const response = await fetch(`/api/media/status?url=${encodeURIComponent(streamUrl)}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || "Falha ao confirmar disponibilidade do stream.");
    }

    if (data.ok) {
      return;
    }

    setStatus(
      "A preparar o video",
      `O stream ainda nao esta pronto (estado ${data.status || "desconhecido"}). Nova tentativa em 10 segundos...`
    );
    await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("O stream nao ficou disponivel a tempo. Tenta novamente dentro de alguns instantes.");
}

async function attachSource(format) {
  const streamUrl = format.url;
  playerSourceLabel.textContent = `${format.id || "stream"} - ${format.resolution || "resolucao desconhecida"}`;
  destroyHls();

  if (/\.m3u8(\?|$)/i.test(streamUrl)) {
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(player);
      return;
    }

    if (player.canPlayType("application/vnd.apple.mpegurl")) {
      player.src = streamUrl;
      return;
    }

    throw new Error("Este browser nao suporta HLS.");
  }

  player.src = streamUrl;
}

async function loadVideo() {
  loadVideoBtn.disabled = true;
  setStatus("A obter formatos", "A pedir links diretos para o video...");

  try {
    const formats = await fetchDownloadFormats();
    const selectedFormat = chooseBestFormat(formats);

    if (!selectedFormat?.url) {
      throw new Error("Nenhum formato reproduzivel foi encontrado.");
    }

    renderFormats(formats, selectedFormat.url);

    const comment = formats.find((format) => typeof format?.comment === "string" && format.comment.trim())?.comment || "";
    if (comment) {
      setStatus("A preparar o video", comment);
    }

    await waitUntilReady(selectedFormat.url);
    await attachSource(selectedFormat);
    setStatus("Video pronto", "O stream ja esta disponivel. Se o player nao arrancar sozinho, carrega em play.");
  } catch (error) {
    destroyHls();
    player.removeAttribute("src");
    player.load();
    playerSourceLabel.textContent = "Sem stream carregado";
    setStatus("Falha ao carregar", error.message || "Nao foi possivel carregar o video.");
  } finally {
    loadVideoBtn.disabled = false;
  }
}

loadVideoBtn.addEventListener("click", () => {
  void loadVideo();
});

void loadVideo();
