// ==========================================================================
// data.js — semua yang perlu kamu ganti ada di sini.
// Ganti teks, foto, dan pengaturan game di bawah ini.
// Jangan sentuh style.css atau script.js kalau cuma mau ganti isi.
// ==========================================================================

const CONFIG = {

    // ---- STAGE 1: LOADING ----
    loading: {
        eyebrow: "PRESS START",
        title: "Memuat Petualangan&hellip;",
        subtitle: "sentuh layar untuk melanjutkan",
        durationMs: 2600 // lama animasi loading sebelum lanjut ke mini game
    },

    // ---- STAGE 2: MINI GAME "SUSUN BARIS" (TETRIS) ----
    game: {
        title: "Susun Baris!",
        instruction: "Geser & putar balok yang jatuh sampai membentuk satu baris penuh",
        columns: 8,        // lebar papan tetris
        rows: 14,          // tinggi papan tetris
        dropIntervalMs: 750, // makin kecil = makin cepat jatuhnya balok
        linesToClear: 1,   // jumlah baris yang harus disusun untuk lanjut ke menu
        clearedMessage: "LINE CLEAR!! ✦"
    },

    // ---- STAGE 3: MENU ----
    menu: {
        title: "Kau Menemukannya",
        subtitle: "di dalamnya ada dua hal untukmu",
        memoriesLabel: "Kenangan Kita",
        giftLabel: "Hadiah Untukmu"
    },

    // ---- STAGE 4: KENANGAN (galeri foto + caption) ----
    memories: {
        title: "Kenangan Kita",
        // ganti src dengan path foto kamu sendiri, taruh di folder yang sama / folder "photos"
        photos: [
            { src: "img/foto 1.jpg", caption: "hari pertama kita jalan berdua" },
            { src: "img/foto 2.jpg", caption: "waktu kamu ketawa sampai nangis" },
            { src: "img/foto 3.jpg", caption: "liburan kecil yang berkesan" },
            { src: "img/foto 4.jpg", caption: "momen paling random tapi lucu" }
        ]
    },

    // ---- STAGE 5: HADIAH (surat + foto) ----
    gift: {
        title: "Untuk Kamu",
        eyebrow: "DARI DASAR LAUT HATIKU",
        letter:
            "Selamat Hari Pacar Nasional, sayang.\n\n" +
            "Kalau semua kenangan kita jadi harta karun, aku rasa sudah nggak ada lagi tempat yang cukup buat menyimpannya. " +
            "Terima kasih sudah menemani hari-hari biasa jadi terasa spesial, dan hari-hari berat jadi terasa ringan.\n\n" +
            "Aku sayang kamu, hari ini dan seterusnya.",
        signoff: "— selalu milikmu",
        photos: [
            { src: "img/foto 5.jpg", caption: "" },
            { src: "img/foto 6.jpg", caption: "" }
        ]
    }

};