import { useEffect, useState } from 'react';

const useGetIP = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pastikan API Key ini valid jika menggunakan versi PRO ip-api.com
  const apiKey = 'LVrd2yny7fyjiU1'; 

  useEffect(() => {
    const fetchLocation = async () => {
      const cached = sessionStorage.getItem('pro_ip_data_max');
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Menggunakan endpoint PRO sesuai apiKey Anda
        const fields = 'status,message,country,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,mobile,proxy,hosting,query,reverse';
        
        const response = await fetch(`https://pro.ip-api.com/json/?key=${apiKey}&fields=${fields}`);
        const result = await response.json();

        if (result.status === 'fail') throw new Error(result.message);
        
        const formattedData = {
          ip: result.query,
          city: result.city,
          district: result.district || 'N/A',
          regionName: result.regionName,
          country: result.country,
          zip: result.zip || 'N/A',
          lat: result.lat,
          lon: result.lon,
          timezone: result.timezone,
          utc_offset: result.offset / 3600, 
          currency: result.currency,
          isp: result.isp,
          org: result.org, 
          as: result.as,
          hostname: result.reverse || 'N/A',
          is_mobile: result.mobile,
          is_vpn: result.proxy,
          is_bot: result.hosting,
        };

        setData(formattedData);
        sessionStorage.setItem('pro_ip_data_max', JSON.stringify(formattedData));
        
      } catch (err) {
        setError(err.message);
        // Fallback jika API Key PRO error/limit: Gunakan versi free
        console.warn("API PRO Error, mencoba fallback ke API Free...");
        try {
          const fbRes = await fetch('http://ip-api.com/json/?fields=66846719');
          const fbResult = await fbRes.json();
          setData({
            ip: fbResult.query,
            city: fbResult.city,
            isp: fbResult.isp,
            lat: fbResult.lat,
            lon: fbResult.lon,
            regionName: fbResult.regionName,
            country: fbResult.country,
            is_vpn: fbResult.proxy,
            is_mobile: fbResult.mobile
          });
        } catch (fbErr) {
          console.error("Semua API IP Gagal.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [apiKey]);

  // Sangat Penting: Harus ada return data
  return { data, loading, error };
};

// INI ADALAH BARIS YANG HILANG DAN MENYEBABKAN ERROR TADI:
export default useGetIP;