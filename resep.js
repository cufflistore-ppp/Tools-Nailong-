(function(){
  window.NTAI_Resep = {
    answer(q){
      q=String(q||"").toLowerCase();
      if(/telur/.test(q)) return "Telur dadar: kocok 2 telur + garam. Panaskan minyak, masak kedua sisi.";
      if(/nasi/.test(q)) return "Nasi: cuci beras, air 1:1,2. Masak, api kecil 15-20 menit, diamkan 5 menit.";
      if(/teh|kopi/.test(q)) return "Air panas + teh/kopi. Seduh 2-3 menit. Gula sesuai selera.";
      return "Resep cepat tersedia: telur, nasi, teh, kopi. Tulis salah satunya.";
    }
  };
})();
