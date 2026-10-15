// Path relatif: frontend & backend disajikan dari server yang sama
const API_URL = "/tanya-ai";

const messages = document.getElementById("cbMessages");
const input    = document.getElementById("cbInput");
const sendBtn  = document.getElementById("cbSend");

// Fungsi membuat bubble pesan di widget
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add("cb-msg", sender);   // sender = "bot" / "user"
  div.textContent = text;                // textContent -> aman dari XSS
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;   // auto scroll ke bawah
  return div;
}

// Ambil pertanyaan dari user, kirim ke backend, tampilkan balasan
async function handleSend() {
  const teks = input.value.trim();
  if (!teks) return;

  addMessage(teks, "user");
  input.value = "";
  sendBtn.disabled = true;

  // 1) Indikator "sedang berpikir"
  const loading = addMessage("⏳ Sedang berpikir...", "bot");

  try {
    // 2) Kirim ke backend
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pertanyaan: teks })
    });

    if (!res.ok) throw new Error("Server error: " + res.status);

    const data = await res.json();

    // 3) Ganti bubble loading dengan jawaban AI
    loading.textContent = data.jawaban;
    messages.scrollTop = messages.scrollHeight;

  } catch (err) {
    loading.textContent = "❌ Maaf, koneksi ke server gagal.";
    console.error(err);
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

// Dua cara memicu: klik tombol / tekan Enter
sendBtn.addEventListener("click", handleSend);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSend();
});
