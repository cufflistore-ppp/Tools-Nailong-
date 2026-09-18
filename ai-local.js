(function () {
  function nowID() {
    try {
      return new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return new Date().toString();
    }
  }

  function mathEval(s) {
    const m = s.replace(/,/g, ".").replace(/x/gi, "*").replace(/:/g, "/").match(/[\d.+\-*/() %]+/);
    if (!m) return null;
    const expr = m[0].replace(/[^0-9.+\-*/() %]/g, "");
    if (!expr.trim()) return null;
    try {
      const n = Function('"use strict";return (' + expr + ")")();
      if (typeof n === "number" && isFinite(n)) return n;
    } catch (_) {}
    return null;
  }

  const DICT = {
    "halo": "Halo juga! Ada yang bisa dibantu? Tanya jam, hitung-hitungan, resep sederhana, caption, atau cara merapikan teks.",
    "hai": "Hai! Silakan tanya kebutuhan harian, misalnya: jam berapa, cara hitung diskon, ide caption, atau daftar belanja.",
    "pagi": "Selamat pagi. Semoga harimu lancar. Mau dibantu hitung, tulis pesan, atau buat daftar tugas?",
    "siang": "Selamat siang. Tanya saja keperluannya.",
    "sore": "Selamat sore. Ada yang mau dihitung atau dituliskan?",
    "malam": "Selamat malam. Kalau mau buat jadwal besok atau pesan sopan, ketik di sini.",
    "terima kasih": "Sama-sama. Kalau masih perlu bantuan, ketik lagi saja.",
    "thanks": "Sama-sama.",
    "siapa kamu": "Saya Asisten Harian NAILONG TOOLS. Berjalan di HP/laptop kamu, tanpa API. Bisa bantu pertanyaan harian, hitungan, teks, dan ide singkat.",
    "apa kabar": "Baik. Semoga kamu juga baik. Mau dibantu apa hari ini?",
    "cuaca": "Cuaca live tidak bisa dicek tanpa internet cuaca. Lihat aplikasi cuaca HP atau BMKG. Di sini bisa bantu hitung, tulis, atau buat rencana kalau hujan.",
    "resep nasi": "Nasi sederhana: cuci beras, rasio air kira-kira 1:1,2. Masak sampai mendidih, kecilkan api, tutup 15–20 menit, diamkan 5 menit, aduk.",
    "resep telur": "Telur dadar: kocok 2 telur + garam + sedikit merica. Panaskan minyak, tuang, masak kedua sisi. Boleh tambah daun bawang.",
    "resep teh": "Teh: air panas, celup teh 2–3 menit, tambah gula atau madu sesuai selera.",
    "resep kopi": "Kopi: 1 sendok kopi + air panas. Aduk. Tambah gula/susu kalau mau.",
    "cara menabung": "Tentukan target. Sisihkan dulu 10% pemasukan sebelum belanja. Catat pengeluaran. Kurangi yang tidak penting. Masukkan ke tempat terpisah.",
    "motivasi": "Kerjakan satu hal kecil dulu. Yang penting mulai. Setelah satu langkah selesai, langkah berikutnya biasanya lebih ringan.",
    "capek": "Istirahat sebentar. Minum air. Stretches ringan. Lanjut kerja yang paling penting saja dulu.",
    "ide caption": "Beberapa ide:\n- Pelan-pelan juga sampai.\n- Hari ini cukup berusaha.\n- Simpan yang membuat tenang.\n- Langkah kecil tetap dihitung.",
    "status wa": "Ide status:\n- Lagi fokus dulu.\n- Jangan lupa makan.\n- Santai, tapi jangan diam.\n- Bersyukur dulu, baru sibuk.",
    "split bill": "Bagi rata: total dibagi jumlah orang. Kalau ada yang pesan lebih mahal, hitung per item dulu lalu jumlahkan per orang.",
    "diskon": "Contoh: harga 100.000 diskon 20% → bayar 80.000. Rumus: harga × (1 - diskon/100).",
    "jam berapa": "Waktu sekarang: " + nowID(),
    "hari ini": "Hari ini: " + nowID(),
    "wib": "WIB = UTC+7. Waktu perangkatmu sekarang: " + nowID(),
    "doa makan": "Sebelum makan, banyak yang membaca doa sesuai agama masing-masing. Intinya bersyukur atas rezeki yang ada.",
    "cara fokus": "Matikan notifikasi sebentar. Timer 25 menit. Kerjakan 1 tugas. Istirahat 5 menit.",
    "daftar belanja": "Contoh daftar: beras, telur, minyak, sayur, buah, sabun, pasta gigi, air minum. Edit sesuai kebutuhan rumah.",
    "pesan sopan": "Contoh: Assalamu’alaikum / Halo, mohon maaf mengganggu. Saya ingin menanyakan ... Terima kasih banyak atas waktunya.",
    "izin tidak masuk": "Contoh: Selamat pagi, saya mohon izin tidak masuk hari ini karena ... Terima kasih atas pengertiannya.",
    "ucapan ulang tahun": "Selamat ulang tahun. Semoga sehat, dimudahkan urusannya, dan hari-harinya lebih tenang.",
    "ucapan selamat": "Selamat ya, semoga lancar terus dan jadi berkah.",
  };

  function pickDict(q) {
    const s = q.toLowerCase().replace(/\s+/g, " ").trim();
    if (DICT[s]) return DICT[s];
    for (const [k, v] of Object.entries(DICT)) {
      if (s.includes(k)) return v;
    }
    return null;
  }

  function answer(raw, toolId) {
    const q = String(raw || "").trim();
    if (!q) return "Tulis pertanyaannya dulu. Contoh: jam berapa, hitung 15% dari 80000, ide caption, resep telur, cara menabung.";

    if (toolId && /product|deskripsi/.test(toolId)) {
      return "Deskripsi produk:\n" + q + " — siap pakai, kualitas terjaga, cocok untuk kebutuhan harian. Pesan sekarang, stok terbatas.";
    }
    if (toolId && /caption|hashtag/.test(toolId)) {
      return "Caption:\n" + q + "\n\n#harian #semangat #nailong";
    }
    if (toolId && /email|reply|balas/.test(toolId)) {
      return "Halo,\n\nTerima kasih pesannya. " + q + "\n\nSalam,\nNAILONG TOOLS";
    }

    const n = mathEval(q);
    if (/[\d]/.test(q) && /[+\-x×*/:%]|dari|persen|diskon/.test(q.toLowerCase()) && n != null) {
      return "Hasil hitungan: " + n;
    }
    const disc = q.toLowerCase().match(/(\d+[.,]?\d*)\s*(?:diskon|off|%|persen)\s*(\d+[.,]?\d*)|diskon\s*(\d+)\s*%\s*(?:dari\s*)?(\d+)/);
    if (disc) {
      let price, pct;
      if (disc[3]) { pct = +disc[3]; price = +disc[4]; }
      else { price = +String(disc[1]).replace(",", "."); pct = +String(disc[2]).replace(",", "."); }
      if (price && pct) {
        const bayar = price * (1 - pct / 100);
        return "Harga " + price + " diskon " + pct + "% → bayar " + bayar;
      }
    }

    const hit = pickDict(q);
    if (hit) return hit;

    if (/jam|tanggal|hari ini|sekarang/.test(q.toLowerCase())) return "Sekarang: " + nowID();
    if (/halo|hai|hello|hi\b/.test(q.toLowerCase())) return DICT.halo;
    if (/cuaca|hujan|panas/.test(q.toLowerCase())) return DICT.cuaca;
    if (/resep|masak/.test(q.toLowerCase())) return "Resep cepat: telur dadar, teh manis, atau nasi. Tulis misalnya: resep telur.";
    if (/caption|status/.test(q.toLowerCase())) return DICT["ide caption"] + "\n\n" + DICT["status wa"];
    if (/hitung|berapa|kalkulator/.test(q.toLowerCase())) return "Tulis angkanya, contoh: 25000*4 atau 15% dari 80000.";

    return "Aku bantu versi harian di perangkat ini, tanpa API.\n\nYang bisa:\n- Jam/tanggal\n- Hitung dan diskon\n- Ide caption / status WA\n- Resep sederhana\n- Pesan sopan / izin\n- Tips menabung dan fokus\n\nPertanyaan kamu: “" + q + "”\nCoba dipersingkat, misalnya: ide caption, resep telur, hitung 12*45.";
  }

  window.NTLocalAI = { answer };
})();
