(function(){
  window.NTAI_Caption = {
    answer(q){
      q = String(q||"").trim() || "hari ini";
      return [
        "Caption 1: " + q + ". Pelan-pelan saja, yang penting jalan.",
        "Caption 2: Catat " + q + " biar nggak hilang.",
        "Caption 3: Semoga " + q + " hari ini lebih ringan."
      ].join("\n");
    }
  };
})();
