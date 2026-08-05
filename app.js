// app.js v2 (ESM)
// Libs via CDN ESM
import * as bip39 from "https://cdn.jsdelivr.net/npm/bip39@3.1.0/+esm";
import * as bitcoin from "https://cdn.jsdelivr.net/npm/bitcoinjs-lib@6.1.7/+esm";
import * as ecc from "https://cdn.jsdelivr.net/npm/tiny-secp256k1@2.2.3/+esm";
import * as bip32mod from "https://cdn.jsdelivr.net/npm/bip32@4.0.0/+esm";
import bs58check from "https://cdn.jsdelivr.net/npm/bs58check@3.0.1/+esm";
import { Buffer } from "https://cdn.jsdelivr.net/npm/buffer@6.0.3/+esm";

window.Buffer = Buffer;
window.bip39 = bip39; // exposto para entropia-info.js (extrai entropia do mnemonic)

const bip32 = bip32mod.BIP32Factory(ecc);

// ──────────────────────────────────────
//  UI HELPERS
// ──────────────────────────────────────
const $ = (id) => document.getElementById(id);

const statusText = $("statusText");
const setStatus = (msg, ok = true) => {
  statusText.textContent = msg;
  const dot = document.querySelector(".dot");
  if (ok) {
    dot.style.background = "var(--ok)";
    dot.style.boxShadow = "0 0 12px rgba(61,220,151,.7)";
  } else {
    dot.style.background = "var(--danger)";
    dot.style.boxShadow = "0 0 12px rgba(255,92,94,.7)";
  }
};

const toHex = (u8) => [...u8].map((b) => b.toString(16).padStart(2, "0")).join("");

const normalizeMnemonic = (s) =>
  s.trim().toLowerCase().replace(/\s+/g, " ");

const wordsFromMnemonic = (mn) =>
  normalizeMnemonic(mn).split(" ").filter(Boolean);

// ──────────────────────────────────────
//  OFFLINE BANNER
// ──────────────────────────────────────
const banner = $("offlineBanner");
const bannerText = $("bannerText");

function updateConnectionStatus() {
  const online = navigator.onLine;
  banner.classList.remove("hidden", "online", "offline");

  if (online) {
    banner.classList.add("online");
    bannerText.textContent =
      "⚠ Você está ONLINE. Para máxima segurança, use offline (modo avião) ao gerar seeds.";
  } else {
    banner.classList.add("offline");
    bannerText.textContent = "✓ Modo offline detectado — ambiente seguro para gerar seeds.";
  }
}

updateConnectionStatus();
window.addEventListener("online",  updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

// ──────────────────────────────────────
//  WORD COUNT BADGE
// ──────────────────────────────────────
function updateWordCount() {
  const words = wordsFromMnemonic($("mnemonic").value);
  const n = words.length;
  const badge = $("wordCount");
  badge.textContent = `${n} palavra${n !== 1 ? "s" : ""}`;
  badge.className = "word-count";

  if (n === 12 || n === 24) {
    badge.classList.add("ok");
  } else if (n > 0) {
    badge.classList.add("warn");
  }
}

$("mnemonic").addEventListener("input", updateWordCount);

// ──────────────────────────────────────
//  MASK / REVEAL SEED
// ──────────────────────────────────────
let masked = false;

$("btnMask").addEventListener("click", () => {
  masked = !masked;
  $("mnemonicWrap").classList.toggle("masked", masked);
  $("btnMask").textContent = masked ? "🙈" : "👁";
  $("btnMask").title = masked ? "Revelar seed" : "Ocultar seed";
});

// ──────────────────────────────────────
//  CRYPTO HELPERS
// ──────────────────────────────────────
async function sha256Bytes(text) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return new Uint8Array(digest);
}

function randomBytes(len) {
  const u8 = new Uint8Array(len);
  crypto.getRandomValues(u8);
  return u8;
}

// SLIP-0132 version bytes
const VERSIONS = {
  xpub: 0x0488b21e,
  ypub: 0x049d7cb2,
  zpub: 0x04b24746,
  tpub: 0x043587cf,
  upub: 0x044a5262,
  vpub: 0x045f1cf6,
};

function convertExtPubVersion(extPub, target) {
  const data = bs58check.decode(extPub);
  const targetVer = VERSIONS[target];
  if (typeof targetVer !== "number") throw new Error("Versão alvo inválida");
  const out = Buffer.from(data);
  out.writeUInt32BE(targetVer >>> 0, 0);
  return bs58check.encode(out);
}

// ──────────────────────────────────────
//  MODE SELECT
// ──────────────────────────────────────
function showTextBoxIfNeeded() {
  const mode = $("mode").value;
  $("textBox").style.display = mode === "text" ? "block" : "none";
}

// Popup de risco do modo "texto": a entropia real depende do que o usuário digitar,
// não da "força" (128/256 bits) selecionada. Precisa de confirmação explícita antes de gerar.
function confirmTextModeRisk() {
  return new Promise((resolve) => {
    const overlay = $("textModeModal");
    const checkbox = $("textModeAck");
    const btnContinue = $("btnTextModeContinue");
    const btnCancel = $("btnTextModeCancel");

    checkbox.checked = false;
    btnContinue.disabled = true;
    overlay.style.display = "flex";

    const onCheck = () => { btnContinue.disabled = !checkbox.checked; };
    const cleanup = () => {
      overlay.style.display = "none";
      checkbox.removeEventListener("change", onCheck);
      btnContinue.removeEventListener("click", onContinue);
      btnCancel.removeEventListener("click", onCancel);
    };
    const onContinue = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };

    checkbox.addEventListener("change", onCheck);
    btnContinue.addEventListener("click", onContinue);
    btnCancel.addEventListener("click", onCancel);
  });
}

$("mode").addEventListener("change", () => {
  showTextBoxIfNeeded();
  if ($("mode").value === "text") confirmTextModeRisk();
});

// ──────────────────────────────────────
//  FONT SIZE
// ──────────────────────────────────────
$("fontSize").addEventListener("input", () => {
  $("fontSizeLabel").textContent = $("fontSize").value;
  const px = `${$("fontSize").value}px`;
  document.querySelectorAll(".word").forEach((el) => (el.style.fontSize = px));
});

// ──────────────────────────────────────
//  CLEAR
// ──────────────────────────────────────
$("btnClear").addEventListener("click", () => {
  $("mnemonic").value = "";
  $("xpub").value = "";
  $("zpub").value = "";
  $("addrReceive").textContent = "";
  $("addrChange").textContent = "";
  $("wordGrid").innerHTML = "";
  $("paperMeta").textContent = "—";
  $("paperZpub").textContent = "";
  $("qrLabel").textContent = "—";
  $("qrCanvasWrap").innerHTML = "zpub<br>aqui";
  $("entropia-painel").innerHTML = "";
  updateWordCount();
  setStatus("Limpo.", true);
});

// ──────────────────────────────────────
//  COPY MNEMONIC
// ──────────────────────────────────────
$("btnCopyMnemonic").addEventListener("click", async () => {
  const mn = normalizeMnemonic($("mnemonic").value);
  if (!mn) return setStatus("Nada pra copiar.", false);
  await navigator.clipboard.writeText(mn);
  setStatus("Mnemonic copiado ✅", true);
});

// ──────────────────────────────────────
//  VALIDATE
// ──────────────────────────────────────
$("btnValidate").addEventListener("click", () => {
  const mn = normalizeMnemonic($("mnemonic").value);
  if (!mn) return setStatus("Cole ou gere um mnemonic primeiro.", false);
  const ok = bip39.validateMnemonic(mn);
  setStatus(ok ? "Mnemonic válido ✅" : "Mnemonic inválido ❌", ok);
});

// ──────────────────────────────────────
//  GENERATE
// ──────────────────────────────────────
$("btnGenerate").addEventListener("click", async () => {
  try {
    const strength = parseInt($("strength").value, 10);
    const mode = $("mode").value;

    let entropy;
    if (mode === "random") {
      // Verificação do CSPRNG ANTES de gerar (lição Coldcard) — aborta se o RNG parecer comprometido
      const numPalavras = strength === 256 ? 24 : 12;
      try {
        window.EntropiaInfo.verificar(numPalavras);
      } catch (err) {
        return setStatus(err.message, false);
      }
      entropy = randomBytes(strength / 8);
    } else {
      const t = ($("seedText").value || "").trim();
      if (!t) return setStatus("Escreve um texto aí, chefia.", false);

      const ack = await confirmTextModeRisk();
      if (!ack) return setStatus("Geração cancelada — troque para o modo Aleatório (CSPRNG).", false);

      const h = await sha256Bytes(t);
      entropy = h.slice(0, strength / 8);
    }

    const mnemonic = bip39.entropyToMnemonic(toHex(entropy));
    $("mnemonic").value = mnemonic;
    updateWordCount();

    // Remove máscara ao gerar novo
    if (masked) {
      masked = false;
      $("mnemonicWrap").classList.remove("masked");
      $("btnMask").textContent = "👁";
    }

    // Painel de entropia só faz sentido no modo Aleatório (CSPRNG) — no modo texto
    // a fonte é o SHA-256 do texto digitado, não window.crypto.getRandomValues()
    if (mode === "random") {
      window.EntropiaInfo.exibir(mnemonic, strength === 256 ? 24 : 12);
    } else {
      const painel = $("entropia-painel");
      if (painel) painel.innerHTML = "";
    }

    setStatus(`Gerado: ${wordsFromMnemonic(mnemonic).length} palavras ✅`, true);
  } catch (e) {
    console.error(e);
    setStatus(`Erro ao gerar: ${e.message}`, false);
  }
});

// ──────────────────────────────────────
//  QR CODE GENERATOR
// ──────────────────────────────────────
function generateQR(zpubValue) {
  const wrap = $("qrCanvasWrap");
  wrap.innerHTML = "";

  if (!zpubValue || zpubValue.startsWith("(falhou")) {
    wrap.textContent = "zpub\nindisponível";
    $("qrLabel").textContent = "—";
    return;
  }

  // QRCode.js é carregado via <script> clássico (não ESM), fica em window.QRCode
  if (typeof window.QRCode === "undefined") {
    wrap.textContent = "QRCode\nnão carregou";
    return;
  }

  new window.QRCode(wrap, {
    text: zpubValue,
    width: 72,
    height: 72,
    colorDark: "#0f172a",
    colorLight: "#ffffff",
    correctLevel: window.QRCode.CorrectLevel.M,
  });

  // Mostra primeiros 12 chars do zpub como label
  $("qrLabel").textContent = zpubValue.slice(0, 10) + "…";
}

// ──────────────────────────────────────
//  BUILD TEMPLATE
// ──────────────────────────────────────
$("btnBuildTemplate").addEventListener("click", () => {
  try {
    const mn = normalizeMnemonic($("mnemonic").value);
    if (!mn) return setStatus("Sem mnemonic, sem origami 😅", false);

    const words = wordsFromMnemonic(mn);
    const n = words.length;
    const layout = n === 12 ? "4x3" : "4x6";
    $("layout").value = layout;

    const cols = 4;
    const rows = n === 12 ? 3 : 6;

    const grid = $("wordGrid");
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const px = `${$("fontSize").value}px`;

    for (let i = 0; i < cols * rows; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const num = document.createElement("div");
      num.className = "num";
      num.textContent = i < n ? String(i + 1) : "—";

      const w = document.createElement("div");
      w.className = "word";
      w.style.fontSize = px;
      w.textContent = i < n ? words[i] : "";

      cell.appendChild(num);
      cell.appendChild(w);
      grid.appendChild(cell);
    }

    const meta = `${n} palavras · ${cols}×${rows} · ${new Date().toLocaleString("pt-BR")}`;
    $("paperMeta").textContent = meta;

    // Preenche zpub no template (se disponível)
    const zpubVal = $("zpub").value.trim();
    if (zpubVal && !zpubVal.startsWith("(falhou")) {
      $("paperZpub").textContent = `zpub: ${zpubVal}`;
      generateQR(zpubVal);
    } else {
      $("paperZpub").textContent = "";
      $("qrCanvasWrap").innerHTML = "zpub<br>aqui";
      $("qrLabel").textContent = "—";
    }

    setStatus("Template montado ✅", true);
  } catch (e) {
    console.error(e);
    setStatus(`Erro no template: ${e.message}`, false);
  }
});

// ──────────────────────────────────────
//  PRINT
// ──────────────────────────────────────
$("btnPrint").addEventListener("click", () => window.print());

// ──────────────────────────────────────
//  DERIVE BIP84
// ──────────────────────────────────────
$("btnDerive").addEventListener("click", async () => {
  try {
    const mn = normalizeMnemonic($("mnemonic").value);
    if (!mn) return setStatus("Cole/gera um mnemonic primeiro.", false);

    if (!bip39.validateMnemonic(mn)) {
      return setStatus("Mnemonic inválido — não vou derivar isso.", false);
    }

    const networkName = $("network").value;
    const network =
      networkName === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

    const count = Math.max(1, Math.min(50, parseInt($("addrCount").value, 10) || 10));

    const seed = await bip39.mnemonicToSeed(mn);
    const root = bip32.fromSeed(seed, network);

    const coinType = networkName === "testnet" ? 1 : 0;
    const account = root
      .deriveHardened(84)
      .deriveHardened(coinType)
      .deriveHardened(0);

    const xpub = account.neutered().toBase58();
    $("xpub").value = xpub;

    let zpub = "";
    try {
      zpub =
        networkName === "testnet"
          ? convertExtPubVersion(xpub, "vpub")
          : convertExtPubVersion(xpub, "zpub");
    } catch {
      zpub = "(falhou converter; xpub ok)";
    }
    $("zpub").value = zpub;

    // Se o template já foi montado, atualiza o QR
    const hasPaper = $("wordGrid").children.length > 0;
    if (hasPaper) {
      $("paperZpub").textContent = zpub.startsWith("(falhou") ? "" : `zpub: ${zpub}`;
      generateQR(zpub);
    }

    // Derive receive / change
    const recv = account.derive(0);
    const chng = account.derive(1);

    const makeAddrList = (node) => {
      const lines = [];
      for (let i = 0; i < count; i++) {
        const child = node.derive(i);
        const { address } = bitcoin.payments.p2wpkh({
          pubkey: child.publicKey,
          network,
        });
        lines.push(`${String(i).padStart(2, "0")}: ${address}`);
      }
      return lines.join("\n");
    };

    $("addrReceive").textContent = makeAddrList(recv);
    $("addrChange").textContent = makeAddrList(chng);

    setStatus(`Derivado BIP84 ✅ (${networkName}, ${count} endereços)`, true);
  } catch (e) {
    console.error(e);
    setStatus(`Erro na derivação: ${e.message}`, false);
  }
});

// ──────────────────────────────────────
//  COPY XPUB/ZPUB
// ──────────────────────────────────────
$("btnCopyXpub").addEventListener("click", async () => {
  const x = $("xpub").value.trim();
  const z = $("zpub").value.trim();
  if (!x && !z) return setStatus("Nada pra copiar.", false);
  await navigator.clipboard.writeText(`xpub: ${x}\nzpub: ${z}`);
  setStatus("xpub/zpub copiado ✅", true);
});

// ──────────────────────────────────────
//  INIT
// ──────────────────────────────────────
showTextBoxIfNeeded();
$("fontSizeLabel").textContent = $("fontSize").value;
updateWordCount();
setStatus("Pronto ✅", true);
