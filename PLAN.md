SEMUA HAL TERKAIT BUILD ADA DI PLAN.md

### 1. Pembagian Peran & Tanggung Jawab (*Role Breakdown*) - *Fully Synchronized*

**Teknologi Inti (*Tech Stack Consensus*):**
*   **Database:** PostgreSQL (Relational integrity & Auditability)
*   **Backend:** FastAPI (Python) - *High performance, auto-generated Swagger docs.*
*   **Frontend:** Next.js (React) + Tailwind CSS - *Fast rendering, responsive UX.*
*   **Deployment:** Vercel (Frontend), Railway/Render/BuildPad (Backend & DB)

---

**Anggota 1: Hadryan (Product Manager & Arsitek Sistem)**

*   **Fokus:** Menjaga visi produk, arsitektur data (*Enterprise Readiness*), manajemen proyek (*vibe coding workflow*), koordinasi desain Figma, dan aset lomba.
*   **Tugas Teknis & Produk (Actionable Items):**
    *   [ ] Merancang *Entity Relationship Diagram* (ERD) strict relational untuk PostgreSQL. Tabel wajib (sesuai CONTEXT.md): `users`, `materials`, `lots`, `audit_logs`.
    *   [ ] Memastikan desain UI di Figma siap untuk dikonversi ke kode dan mengoordinasikan pemilihan strategi konversi (Plugin, AI Visual, atau Component Library).
    *   [ ] Mendefinisikan *API Contracts* (Format Request/Response JSON) di Swagger Docs/Postman.
    *   [ ] Mengelola *Repository* GitHub: *Setup Branching Strategy* (main, dev, feature-branches) dan *Pull Request templates*.
    *   [ ] **Deliverable Lomba:** Menyusun *Pitch Deck* (10 slide wajib: Problem -> Solution -> Market -> Traction/Demo -> Team -> CTA).
    *   [ ] **Deliverable Lomba:** Membuat *storyboard* dan menyutradarai Video Demo (Maks. 3 menit, fokus pada alur *Intake* -> QC -> PPIC).

**Anggota 2: Benedictus (Backend & Security Engineer)**

*   **Fokus:** Skalabilitas, Keamanan (RBAC), *Immutable Logs*, dan API *Performance* (Bobot 30% *Enterprise Readiness*).
*   **Tugas Teknis (Actionable Items):**
    *   [ ] *Setup Environment* FastAPI & Koneksi SQLAlchemy/SQLModel ke PostgreSQL.
    *   [ ] Implementasi *Authentication* (JWT) & Middleware RBAC yang presisi. (Enum Role Wajib: `SUPER_ADMIN`, `INTAKE_STAFF`, `QC_INSPECTOR`, `PPIC_MANAGER`).
    *   [ ] Membangun RESTful API *Endpoints* untuk siklus `lots` (*State Machine Rules*):
        *   **Intake:** Endpoint khusus `INTAKE_STAFF` (Generate `lot_number`, status otomatis `PENDING_QC`).
        *   **QC:** Endpoint khusus `QC_INSPECTOR` (Ubah status ke `APPROVED` atau `REJECTED`).
        *   **PPIC:** Endpoint khusus `PPIC_MANAGER` (Assign `warehouse_slot`, ubah status ke `IN_PRODUCTION`).
    *   [ ] **Enterprise Feature (KRUSIAL):** Menjamin *Immutable Audit Trails*. Dilarang keras melakukan UPDATE pada tabel `lots` tanpa melakukan INSERT ke tabel `audit_logs` di dalam satu transaksi *database* yang sama.
    *   [ ] Menerapkan standar *Error Handling* & HTTP Status Codes (400, 401, 403, hindari 500 generik).
    *   [ ] **Deployment:** Persiapkan `Dockerfile` dan manajemen `.env` yang rapi untuk integrasi ke BuildPad/AWS.

**Anggota 3: Asher (Frontend / UI Engineer)**

*   **Fokus:** Pengalaman pengguna (*UX*), Antarmuka Intuitif, Responsivitas (Bobot 20% *UX & Design*), dan Implementasi Desain Figma.
*   **Tugas Teknis (Actionable Items):**
    *   [ ] *Setup Project* Next.js + Tailwind CSS + *State Management*.
    *   [ ] **Workflow Figma to Code:** Mengimplementasikan desain dari Figma menggunakan salah satu strategi efisien:
        *   **Opsi 1 (Plugin):** Menggunakan *Builder.io* atau *Locofy* untuk ekspor komponen langsung ke Next.js.
        *   **Opsi 2 (AI Visual):** Menggunakan *v0.dev* atau AI Vision (Claude/GPT) untuk men-generate komponen Tailwind berdasarkan tangkapan layar Figma.
        *   **Opsi 3 (Component Library):** Menggunakan *shadcn/ui* untuk merakit UI yang profesional dan *Enterprise Ready* berdasarkan layout Figma.
    *   [ ] Membangun Sistem *Routing* yang terproteksi (*Protected Routes*) berdasarkan matriks peran (`INTAKE_STAFF`, `QC_INSPECTOR`, `PPIC_MANAGER`, `SUPER_ADMIN`).
    *   [ ] **Dashboard 1 (Intake Staff):** Form input kedatangan bahan baku. Hanya berhak memanggil API pembuatan `lots` awal (Status `PENDING_QC`).
    *   [ ] **Dashboard 2 (QC Inspector):** Tabel antrean inspeksi (hanya menampilkan barang dengan status `PENDING_QC`). Terdapat tombol *Approve/Reject*.
    *   [ ] **Dashboard 3 (PPIC Manager):** Visualisasi gudang & jadwal. Hanya menampilkan barang `APPROVED`. Menyediakan form untuk mengalokasikan `warehouse_slot` dan memproses status menjadi `IN_PRODUCTION`.
    *   [ ] Memastikan *feedback* instan (*Toast notifications*, *loading skeletons*) saat API dipanggil agar UI terasa premium.
    *   [ ] *Catatan Penting:* Seluruh *copywriting* di UI harus dalam Bahasa Inggris.

**Anggota 4: Aga (Integration QA & Data Engineer)**

*   **Fokus:** Sinkronisasi API-UI, Data Dummy Skala *Enterprise*, dan Jaminan Mutu (Zero *Bugs* saat Demo).
*   **Tugas Teknis (Actionable Items):**
    *   [ ] **Data Engineering:** Membuat *script* injeksi data *dummy* bahan baku industri (*Flavor & Fragrance*) ke dalam tabel `materials`. Menyuntikkan 500+ record variasi pergerakan `lots` (`PENDING_QC`, `APPROVED`, `REJECTED`, `IN_PRODUCTION`).
    *   [ ] **Integration:** Membantu sinkronisasi *Frontend components* and API *Backend*.
    *   [ ] Menangani *State Management* sinkronisasi data (menggunakan SWR atau React Query untuk *auto-refresh* tabel tanpa *reload*).
    *   [ ] **QA Testing:** Melakukan E2E Testing (Manual) untuk memvalidasi *State Machine*. Contoh celah yang harus dijaga: Pastikan role `INTAKE_STAFF` tidak bisa melakukan persetujuan QC melalui celah API.
    *   [ ] Melaporkan *bugs/UI glitches* ke *issue tracker* GitHub untuk perbaikan.

---

### 2. Timeline Eksekusi 4 Hari (28 Mei - 31 Mei) - *Aligned with CONTEXT.md*

*Catatan: Sesuai CONTEXT.md, seluruh basis kode, UI, dan dokumentasi repositori akan ditulis dalam Bahasa Inggris. File PLAN.md ini merupakan panduan internal tim.*

**Hari 1 (Kamis, 28 Mei): Foundation & Database Schema (The Single Source of Truth)**

*   **Milestone:** Infrastruktur dasar siap, *Database* tersambung, dan kerangka aplikasi berjalan di *localhost*.
*   **Hadryan (PM/Arsitek):** Merancang ERD relasional murni (Tabel `users`, `materials`, `lots`, `audit_logs`). Menyusun Slide 1-3 *Pitch Deck*.
*   **Benedictus (Backend):** *Setup* FastAPI, SQLAlchemy/SQLModel. Membuat skema dan relasi basis data PostgreSQL.
*   **Asher (Frontend):** *Setup* Next.js + Tailwind CSS. Membuat kerangka UI dasar (*Sidebar*, form Login).
*   **Aga (QA/Data):** Mempersiapkan daftar data *dummy* `materials` (Sima Arome) dalam format bahasa Inggris.
*   **Daily Sync (Malam):** Verifikasi koneksi Frontend ke API "Hello World" dari Backend.

**Hari 2 (Jumat, 29 Mei): RBAC, Audit Logs, & Modul Intake (Vibe Coding Phase 1)**

*   **Milestone:** Sistem Login JWT berfungsi, `INTAKE_STAFF` bisa membuat entri di tabel `lots`, dan `audit_logs` mulai mencatat transaksi secara otomatis (satu transaksi db).
*   **Benedictus (Backend):** Implementasi JWT Auth & Middleware RBAC (`SUPER_ADMIN`, `INTAKE_STAFF`, `QC_INSPECTOR`, `PPIC_MANAGER`). Membangun API untuk Intake dengan *trigger* `audit_logs`.
*   **Asher (Frontend):** Membangun UI *Dashboard Intake Staff*. Mengonsumsi API.
*   **Aga (QA/Data):** Menguji API Intake dengan skenario RBAC positif & negatif via Postman. Menulis *script* injeksi.
*   **Hadryan (PM/Arsitek):** Menyelesaikan draf *Pitch Deck* (Slide 4-10) dan draf *storyboard* Video Demo.
*   **Daily Sync (Malam):** Integrasi UI Form Intake dengan Backend. Validasi bahwa tabel `lots` terisi dan tabel `audit_logs` mencatat riwayat penambahan data.

**Hari 3 (Sabtu, 30 Mei): Modul QC, PPIC, & Deployment (Vibe Coding Phase 2)**

*   **Milestone:** *State Machine rules* lengkap (Intake -> QC -> PPIC). Aplikasi di-*deploy* ke BuildPad / AWS.
*   **Benedictus (Backend):** Membuat API berjenjang khusus `QC_INSPECTOR` (hanya `PENDING_QC` -> `APPROVED`/`REJECTED`) & `PPIC_MANAGER` (hanya `APPROVED` -> tambah `warehouse_slot` & ubah ke `IN_PRODUCTION`). Deploy ke **BuildPad** / AWS.
*   **Asher (Frontend):** Membangun tabel *approval* (*Dashboard QC*) dan visualisasi penjadwalan/gudang (*Dashboard PPIC*). Pasang *conditional rendering* berdasarkan token JWT.
*   **Aga (QA/Data):** Menjalankan *script* injeksi skala *enterprise* (500+ *dummy lots*). Melakukan simulasi pengujian ekstrem (memastikan *State Machine Rules* tak bisa dilompati).
*   **Daily Sync (Sore):** Menguji skenario aplikasi via URL publik (*Cloud*).

**Hari 4 (Minggu, 31 Mei): Freeze, Polishing, & Submission**

*   **Pagi (08:00 - 12:00):** *Code Freeze*! Pembersihan *bug* pada antarmuka, menajamkan teks UI ke dalam bahasa Inggris yang profesional, dan merapikan *Error Handling*.
*   **Siang (13:00 - 16:00):** Hadryan menyutradarai perekaman Video Demo (maks. 3 menit). Fokuskan demonstrasi pada kelancaran *workflow* dan arsitektur *Enterprise* (Audit Logs & matriks izin RBAC).
*   **Sore (16:00 - 19:00):** Finalisasi dokumen PDF *Pitch Deck* dan publikasi Video. Cek kelengkapan repositori GitHub (`README.md` dan `Dockerfile` harus ada).
*   **Malam (19:00 - 23:00):** Tinjauan terakhir keseluruhan aset. *Submit* tugas akhir sebelum batas waktu pukul 23:59 WIB.
