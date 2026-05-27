SEMUA HAL TERKAIT BUILD ADA DI PLAN.md

### 1. Pembagian Peran & Tanggung Jawab (*Role Breakdown*)

**Anggota 1: Hadryan (Product Manager & Arsitek Sistem)**

* **Fokus:** Menjaga visi produk, memastikan alur kerja logis, merancang arsitektur basis data, dan menyusun aset presentasi lomba.
* **Tugas Teknis & Produk:**
* Mendefinisikan *API Contracts* dan merancang skema relasi *database* di PostgreSQL (tabel `Users`, `Inventory`, `LotTracking`, `AuditLogs`).
* Membuat struktur repositori di GitHub dan mengatur *branching* agar proses *vibe coding* tidak saling bentrok.
* Menyusun *Pitch Deck* sesuai dengan 10 kerangka wajib dari lomba (Problem Statement hingga Call to Action).
* Membuat *storyboard* dan menjadi sutradara untuk Video Demo 3 menit (syarat wajib).



**Anggota 2: Benedictus (Backend & Security Engineer)**

* **Fokus:** Membangun *endpoints* berkecepatan tinggi, logika bisnis, dan menembus kriteria *Enterprise Readiness* (bobot 30%).
* **Tugas Teknis:**
* Membangun *backend* menggunakan *framework* seperti FastAPI untuk *routing* data yang cepat.
* Mengimplementasikan *Role-Based Access Control* (RBAC) agar URL QC tidak bisa diakses oleh operator gudang.
* Membangun fitur *Immutable Audit Trails* (mencatat setiap perubahan data: siapa, jam berapa, apa yang diubah).
* Melakukan *deployment* aplikasi ke layanan *cloud* seperti AWS atau menggunakan BuildPad untuk meraih poin bonus.



**Anggota 3: Asher (Frontend / UI Engineer)**

* **Fokus:** Mengubah alur data yang kompleks menjadi antarmuka yang sangat intuitif, mengamankan poin *User Experience & Design* (bobot 20%).
* **Tugas Teknis:**
* Membangun 3 *dashboard* antarmuka utama yang berbeda:
1. **Dashboard Supplier/Intake:** Form input bahan baku masuk dan otomatisasi *generate* ID Lot.
2. **Dashboard QC:** Layar untuk *approve/reject* status barang.
3. **Dashboard PPIC & Gudang:** Tabel penjadwalan produksi dan visualisasi denah alokasi drum di gudang.


* Memastikan UI responsif dan perpindahan antar halaman terasa instan (tidak ada *loading* yang lama).



**Anggota 4: Aga (Integration QA & Data Engineer)**

* **Fokus:** Menghubungkan *frontend* dan *backend*, memastikan *state management* berjalan mulus, dan menyiapkan data yang realistis.
* **Tugas Teknis:**
* Mengkonsumsi API dari *backend* ke *frontend*.
* Membuat *script* untuk memasukkan ratusan data *dummy* bahan baku yang relevan dengan Sima Arome (ekstrak alami, F&B, kosmetik) agar saat demo, aplikasinya terlihat "hidup" dan padat data.
* Melakukan *Quality Assurance* (QA) dengan menguji alur secara ekstrem dari hulu ke hilir untuk memastikan tidak ada fitur yang patah (*broken link*) saat direkam untuk demo.



---

### 2. Timeline Eksekusi 4 Hari (28 Mei - 31 Mei)

**Hari 1 (Kamis, 28 Mei): Fondasi & Arsitektur**

* **Anda:** *Setup* repositori GitHub, definisikan skema PostgreSQL, dan tulis draf *Pitch Deck* (Slide 1-3).
* **Backend:** *Setup environment*, koneksi *database*, dan buat API CRUD dasar untuk modul *Intake*.
* **Frontend:** Inisialisasi *project*, pasang *library* UI (seperti Tailwind/Chakra UI), dan buat *layout* kerangka (Sidebar, Header, Tabel kosong).
* **QA/Data:** Mencari dan menyusun daftar data *dummy* industri *flavor & fragrance* dalam format JSON/CSV.

**Hari 2 (Jumat, 29 Mei): Integrasi Inti (Vibe Coding Puncak)**

* **Backend:** Selesaikan fitur RBAC (Sistem Login dengan peran) dan fitur *Audit Trails*.
* **Frontend:** Selesaikan UI form *Intake* dan halaman persetujuan QC.
* **Anda & QA:** Mulai tembak data *dummy* lewat API. Pastikan ketika barang diinput, statusnya menggantung di antrean QC.
* **Anda:** Selesaikan draf kasar *Pitch Deck* (Slide 4-10).

**Hari 3 (Sabtu, 30 Mei): Fitur PPIC & Deployment (Krusial!)**

* **Frontend & Backend:** Selesaikan modul terakhir (PPIC / *Warehouse Routing*). Pastikan barang yang lolos QC otomatis muncul di jadwal PPIC.
* **Backend:** Lakukan percobaan *deployment* ke **BuildPad** / AWS. Jangan tunggu hari Minggu!
* **Anda & Tim:** Uji coba skenario presentasi di aplikasi yang sudah *live* (diakses via *browser*, bukan *localhost*).

**Hari 4 (Minggu, 31 Mei): Perekaman & Finalisasi**

* **Pagi:** Perbaikan *bug* minor (*UI glitch*). Kunci semua perubahan kode (Tutup proses *Vibe Coding*).
* **Siang:** Rekam Video Demo (maksimal 3 menit). Tunjukkan *workflow* mulus dari Gudang -> QC -> PPIC.
* **Sore:** Finalisasi desain PDF *Pitch Deck*. Pastikan repositori GitHub sudah di-set publik dengan file README yang rapi (meskipun opsional, ini menunjukkan profesionalisme).
* **Malam:** *Submit* melalui tautan wajib lomba sebelum 23:59 WIB.