let publicFiles = [];
let localFiles = [];
let activeFilter = "all";

const $ = (id) => document.getElementById(id);

function category(file) {
  const name = file.name.toLowerCase();
  if (/\\.(png|jpe?g|gif|webp|svg|bmp|avif|heic)$/.test(name)) return "image";
  if (/\\.(mp4|mov|avi|mkv|webm|m4v)$/.test(name)) return "video";
  if (/\\.(pdf|docx?|xlsx?|pptx?|txt|csv|rtf|odt|ods|odp)$/.test(name)) return "document";
  return "other";
}

function categoryName(type) {
  return ({ document: "Dokumen", image: "Gambar", video: "Video", other: "Lainnya" })[type] || "Lainnya";
}

function formatSize(bytes) {
  if (bytes == null) return "—";
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderRows(items, targetId, isLocal = false) {
  $(targetId).innerHTML = items.map(file => {
    const fileLink = isLocal ? file.localUrl : file.path;
    const action = isLocal
      ? `<a class="download" href="${fileLink}" download="${escapeHTML(file.name)}">↓ Unduh</a>`
      : `<a class="download" href="${encodeURI(fileLink)}" download="${escapeHTML(file.name)}" target="_blank" rel="noopener">↓ Unduh</a>`;

    return `<tr>
      <td><div class="fname">${escapeHTML(file.name)}</div>
          <div class="subname">${escapeHTML(file.description || file.name)}</div></td>
      <td><span class="pill">${categoryName(category(file))}</span></td>
      <td>${formatSize(file.size)}</td>
      <td>${action}</td>
    </tr>`;
  }).join("");
}

function render() {
  const query = $("search").value.trim().toLowerCase();
  const sort = $("sort").value;

  let list = publicFiles.filter(file =>
    (activeFilter === "all" || category(file) === activeFilter) &&
    file.name.toLowerCase().includes(query)
  );

  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "id"));
  else if (sort === "oldest") list.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
  else list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

  renderRows(list, "rows");
  $("empty").hidden = list.length > 0;

  $("total").textContent = publicFiles.length;
  $("docs").textContent = publicFiles.filter(file => category(file) === "document").length;
  $("images").textContent = publicFiles.filter(file => category(file) === "image").length;
  $("types").textContent = new Set(publicFiles.map(category)).size;
  $("countAll").textContent = publicFiles.length;

  const titles = { all: "Semua file", document: "Dokumen", image: "Gambar", video: "Video", other: "Lainnya" };
  $("pageTitle").textContent = titles[activeFilter];

  document.querySelectorAll("[data-filter]").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
  });
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4500);
}

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    render();
    $("sidebar").classList.remove("open");
  });
});

$("search").addEventListener("input", render);
$("sort").addEventListener("change", render);
$("menuBtn").addEventListener("click", () => $("sidebar").classList.toggle("open"));

$("uploadButton").addEventListener("click", () => $("fileInput").click());

$("fileInput").addEventListener("change", event => {
  // Pratinjau lokal sahaja: fail tidak dihantar ke hosting.
  localFiles.forEach(file => URL.revokeObjectURL(file.localUrl));
  localFiles = Array.from(event.target.files).map(file => ({
    name: file.name,
    size: file.size,
    type: file.type,
    localUrl: URL.createObjectURL(file),
    description: "Pratinjau lokal — hanya terlihat di perangkat ini"
  }));

  $("previewBox").hidden = localFiles.length === 0;
  $("previewPanel").hidden = localFiles.length === 0;
  renderRows(localFiles, "previewRows", true);

  if (localFiles.length) {
    showToast(`${localFiles.length} file dipilih untuk pratinjau lokal. Agar publik, tambahkan ke folder files/ dan files.json.`);
  }
  event.target.value = "";
});

$("clearPreview").addEventListener("click", () => {
  localFiles.forEach(file => URL.revokeObjectURL(file.localUrl));
  localFiles = [];
  $("previewBox").hidden = true;
  $("previewPanel").hidden = true;
  $("previewRows").innerHTML = "";
});

async function loadPublicFiles() {
  try {
    const response = await fetch("files.json", { cache: "no-store" });
    if (!response.ok) throw new Error("files.json gagal dimuat");
    const data = await response.json();

    if (!Array.isArray(data.files)) throw new Error('Format files.json harus memiliki array "files".');

    publicFiles = data.files.filter(file =>
      file && typeof file.name === "string" && typeof file.path === "string"
    );
    render();
  } catch (error) {
    console.error(error);
    publicFiles = [];
    render();
    showToast("Daftar file publik gagal dimuat. Jalankan lewat hosting/server lokal dan periksa files.json.");
  }
}

loadPublicFiles();
