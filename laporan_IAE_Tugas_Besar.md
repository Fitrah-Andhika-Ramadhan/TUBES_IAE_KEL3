# Laporan Tugas Besar Interoperabilitas Aplikasi Enterprise (IAE)
## Sistem Agensi Perjalanan Berbasis Microservices

**Disusun oleh: Kelompok 3**

---

### Abstrak

Proyek ini mengimplementasikan sebuah platform agensi perjalanan modern dengan mengadopsi arsitektur *microservices*. Sistem ini dirancang untuk menjadi modular, dapat diskalakan (*scalable*), dan mudah dikelola dengan memisahkan fungsionalitas utama ke dalam layanan-layanan independen. Arsitektur ini mencakup tujuh layanan backend, sebuah API Gateway yang berfungsi sebagai titik masuk tunggal, dan antarmuka pengguna (frontend) berbasis web. Interoperabilitas antar komponen dicapai melalui kombinasi REST API untuk komunikasi internal dan GraphQL untuk komunikasi antara frontend dan backend, yang menunjukkan penerapan pola desain modern dalam sistem terdistribusi.

    Booking -- REST API --> Flights
    Booking -- REST API --> Hotels
    Booking -- REST API --> Trains
    Booking -- REST API --> LocalTravel
    Booking -- REST API --> Payment

    Users <--> DB
    Flights <--> DB
    Hotels <--> DB
    Trains <--> DB
    LocalTravel <--> DB
    Booking <--> DB
    Payment <--> DB
```
|      Frontend (React)    |
| (Apollo Client, MUI)     |
+--------------------------+
           |
           | (GraphQL: Queries/Mutations)
           v
+--------------------------+
|   API Gateway (Node.js)  |
| (Apollo Server, Express) |
+--------------------------+
     |      |      |      |
(REST API Calls: GET, POST, etc.)
     |      |      |      |
     v      v      v      v
+--------+ +--------+ +--------+ +-------+
| Users  | | Flight | | Hotel  | | (etc) |
| Service| | Service| | Service| |Service|
+--------+ +--------+ +--------+ +-------+
     |      |      |      |
     v      v      v      v
+--------+ +--------+ +--------+ +-------+
|  Users | | Flight | | Hotel  | | (etc) |
|   DB   | |   DB   | |   DB   | |  DB   |
+--------+ +--------+ +--------+ +-------+
```

#### 2.3. Deskripsi Komponen

##### 2.3.1. Frontend
-   **Teknologi:** React, Material-UI, Apollo Client.
-   **Tanggung Jawab:** Menyediakan antarmuka pengguna (UI) yang interaktif dan responsif. Semua interaksi data dengan backend dilakukan melalui query dan mutasi GraphQL ke API Gateway. Penggunaan Apollo Client menyederhanakan manajemen state dan *data fetching*.

##### 2.3.2. API Gateway
-   **Teknologi:** Node.js, Express.js, Apollo Server, `http-proxy-middleware`.
-   **Tanggung Jawab:**
    1.  **Single Entry Point:** Bertindak sebagai satu-satunya titik masuk untuk semua permintaan dari frontend.
    2.  **GraphQL Aggregation:** Mengekspos skema GraphQL terpadu ke frontend. Ketika menerima query, gateway akan mengambil data dari satu atau lebih microservice backend melalui REST API, menggabungkannya, dan mengirimkan respons tunggal.
    3.  **Routing & Proxy:** Meneruskan permintaan REST sederhana (jika ada) ke layanan yang sesuai.
    4.  **Sentralisasi Otentikasi:** Memvalidasi token (JWT) sebelum meneruskan permintaan ke layanan yang dilindungi.

##### 2.3.3. Microservices Backend
Setiap layanan dibangun menggunakan Node.js dan Express.js, mengekspos REST API untuk penggunaan internal (oleh API Gateway).
-   **Users Service:** Mengelola registrasi, login, profil pengguna, dan pembuatan JSON Web Tokens (JWT).
-   **Flight Service:** Mengelola data penerbangan, termasuk jadwal, ketersediaan kursi, dan harga.
-   **Hotel Service:** Mengelola data hotel, ketersediaan kamar, dan harga.
-   **Train Service:** Mengelola data kereta, jadwal, dan ketersediaan.
-   **Local Travel Service:** Mengelola layanan perjalanan lokal seperti penyewaan mobil.
-   **Booking Service:** Mengelola proses pemesanan. Layanan ini berinteraksi dengan layanan lain (Penerbangan, Hotel, dll.) untuk memvalidasi dan mengurangi inventaris.
-   **Payment Service:** Mengelola transaksi pembayaran dan riwayatnya.

##### 2.3.4. Database
-   **Teknologi:** MySQL.
-   **Pola:** *Database per Service*. Setiap microservice memiliki database sendiri yang terisolasi. Misalnya, `users-service` menggunakan `travel_users_db`, dan `flight-service` menggunakan `travel_flight_db`. Pola ini mencegah *tight coupling* di tingkat data dan memungkinkan setiap layanan untuk mengelola skema datanya secara independen.

---

### 3. Alur Komunikasi dan Interoperabilitas

Interoperabilitas adalah kunci dalam arsitektur ini, yang dicapai melalui dua lapisan protokol komunikasi.

#### 3.1. Komunikasi Frontend ke API Gateway (GraphQL)
Frontend tidak perlu tahu tentang keberadaan microservice individual. Ia hanya berkomunikasi dengan API Gateway menggunakan GraphQL.
-   **Keuntungan:**
    -   **Efisiensi Data:** Frontend dapat meminta data yang dibutuhkannya secara spesifik dalam satu permintaan, menghindari *over-fetching* atau *under-fetching*.
    -   **Abstraksi:** Kompleksitas backend (banyaknya layanan) disembunyikan dari frontend.
    -   **Evolusi API yang Mudah:** Skema GraphQL dapat dikembangkan tanpa merusak klien yang ada.

#### 3.2. Komunikasi API Gateway ke Microservices (REST API)
API Gateway bertindak sebagai klien untuk semua microservice backend. Ketika sebuah resolver GraphQL dieksekusi di Gateway, ia membuat satu atau lebih panggilan REST API ke layanan internal.
-   **Contoh:** Sebuah query GraphQL untuk `flight(id: "123")` di API Gateway akan diterjemahkan menjadi panggilan `GET http://flight-service:3002/api/flights/123`.

#### 3.3. Contoh Alur Kerja: Proses Pemesanan Tiket Pesawat
1.  **Pengguna mencari penerbangan:** Frontend mengirim query `filterFlights(...)` ke API Gateway.
2.  **Gateway memproses:** Resolver `filterFlights` di Gateway dieksekusi, lalu memanggil endpoint `GET /api/flights/filter` di `flight-service`.
3.  **Pengguna memesan:** Pengguna memilih penerbangan dan menekan tombol "Pesan". Frontend mengirim mutasi `createBooking(...)` ke API Gateway.
4.  **Gateway memproses booking:** Resolver `createBooking` di Gateway memanggil endpoint `POST /api/bookings` di `booking-service`.
5.  **Booking Service bekerja:**
    a.  `booking-service` menerima permintaan.
    b.  Ia memanggil `flight-service` untuk memverifikasi ketersediaan dan mengurangi jumlah kursi yang tersedia (misalnya, `POST /api/flights/{id}/availability/decrease`).
    c.  Ia menyimpan data pemesanan ke databasenya (`travel_booking_db`).
    d.  Ia mungkin juga berinteraksi dengan `payment-service` untuk memulai proses pembayaran.
6.  **Respons kembali:** Hasilnya dikembalikan melalui rantai yang sama ke frontend.

---

### 4. Teknologi yang Digunakan
-   **Backend:** Node.js, Express.js
-   **Frontend:** React, Material-UI, Apollo Client
-   **API Gateway:** Apollo Server (GraphQL), `http-proxy-middleware`
-   **Database:** MySQL
-   **Kontainerisasi:** Docker, Docker Compose
-   **Lainnya:** `jsonwebtoken` untuk otentikasi, `axios` untuk panggilan HTTP, `morgan` untuk logging.

---

### 5. Desain Database
Seperti yang dijelaskan dalam arsitektur, proyek ini mengadopsi pola **Database per Service**. Setiap microservice bertanggung jawab penuh atas datanya sendiri dan memiliki skema database yang terpisah. Hal ini memastikan otonomi dan *loose coupling* antar layanan. Inisialisasi database dilakukan dengan membuat database terpisah untuk setiap layanan, seperti `travel_users_db`, `travel_flight_db`, dan seterusnya, dengan hak akses yang diberikan kepada pengguna database tunggal yang digunakan oleh semua layanan.

---

### 6. Panduan Penggunaan dan Deployment

Aplikasi ini dirancang untuk dijalankan menggunakan Docker, yang menyederhanakan proses setup dan deployment.

#### 6.1. Konfigurasi Lingkungan
Setiap layanan dan API Gateway memiliki file `.env` untuk konfigurasi variabel lingkungan seperti port, kredensial database, dan URL layanan lain. File `docker-compose.yaml` menggunakan variabel-variabel ini untuk mengonfigurasi setiap kontainer saat dijalankan.

#### 6.2. Menjalankan Aplikasi dengan Docker Compose
Untuk menjalankan seluruh sistem, cukup jalankan perintah berikut dari direktori root proyek:
```bash
docker-compose up -d
```
Perintah ini akan:
1.  Membangun image Docker untuk setiap layanan (jika belum ada).
2.  Membuat dan menjalankan kontainer untuk semua layanan yang didefinisikan di `docker-compose.yaml`, termasuk database.
3.  Menghubungkan layanan-layanan tersebut dalam satu jaringan Docker, memungkinkan mereka berkomunikasi satu sama lain menggunakan nama layanan (misalnya, `http://flight-service:3002`).

---

### 7. Penutup

#### 7.1. Kesimpulan
Proyek ini berhasil mengimplementasikan sistem agensi perjalanan yang fungsional menggunakan arsitektur *microservices*. Penggunaan API Gateway dengan GraphQL terbukti efektif dalam menyederhanakan interaksi klien dan mengabstraksi kompleksitas sistem backend. Pola *Database per Service* dan kontainerisasi dengan Docker juga berhasil diterapkan untuk menciptakan sistem yang modular, dapat diskalakan, dan mudah dikelola.

#### 7.2. Saran Pengembangan
-   **Event-Driven Communication:** Untuk komunikasi *asynchronous* (misalnya, notifikasi setelah pembayaran berhasil), sistem dapat ditingkatkan dengan menggunakan *message broker* seperti RabbitMQ atau Kafka.
-   **Service Discovery:** Mengimplementasikan *service discovery tool* seperti Consul atau etcd untuk mengelola alamat layanan secara dinamis.
-   **CI/CD Pipeline:** Membuat pipeline *Continuous Integration/Continuous Deployment* untuk mengotomatiskan proses testing dan deployment setiap microservice secara independen.
