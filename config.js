/* NAILONG TOOLS v148.027.00 configuration */
window.NT_CONFIG = {
  version: "148.027.00",
  name: "TOOLS 〆 NAILONG",
  firebaseEnabled: false,
  firebaseConfig: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  adminEmails: ["owner@nailong.tools"],
  aiEndpoint: "/api/ai",
  maintenance: false,

  /* Official links — ganti dengan data aslimu */
  whatsappChannel: "https://whatsapp.com/channel/YOUR_CHANNEL",
  whatsappAdmin: "https://wa.me/62XXXXXXXXXXX",
  apkUrl: "assets/nailong-tools.apk",
  qrisImage: "assets/qris.jpg",

  /* Owner / admin login (bisa diganti) */
  owner: {
    username: "NailongOwner",
    password: "NailongAdmin#148",
    email: "owner@nailong.tools"
  },

  /* Harga VIP (Rupiah) */
  vipPlans: [
    { id: "vip-1d", name: "Member VIP 1 Hari", days: 1, price: 5000, label: "Rp 5.000" },
    { id: "vip-3d", name: "Member VIP 3 Hari", days: 3, price: 12000, label: "Rp 12.000" },
    { id: "vip-7d", name: "Member VIP 7 Hari", days: 7, price: 25000, label: "Rp 25.000" },
    { id: "vip-perm", name: "Member VIP Permanen", days: 0, price: 75000, label: "Rp 75.000", permanent: true }
  ]
};
