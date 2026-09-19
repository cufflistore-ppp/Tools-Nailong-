(function(){
  window.NTAI_Hitung = {
    answer(q){
      const s=String(q||"").replace(/,/g,".").replace(/x/gi,"*").replace(/:/g,"/");
      const m=s.match(/[\d.+\-*/() %]+/);
      if(!m) return "Tulis hitungan, contoh 12*45 atau 15% dari 80000.";
      try{
        const n=Function('"use strict";return ('+m[0].replace(/[^0-9.+\-*/() %]/g,"")+")")();
        if(typeof n==="number" && isFinite(n)) return "Hasil: "+n;
      }catch(e){}
      return "Hitungan tidak terbaca.";
    }
  };
})();
