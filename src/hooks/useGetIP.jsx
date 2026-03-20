import { useEffect, useState } from 'react';

const useGetIP = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        // Menggunakan ipapi.co (Mendukung HTTPS gratis)
        const response = await fetch('https://ipapi.co/json/');
        
        if (!response.ok) throw new Error('Gagal fetch data IP');
        
        const result = await response.json();
        
        setData({
          ip: result.ip,
          city: result.city,
          regionName: result.region,
          country: result.country_name,
          lat: result.latitude,
          lon: result.longitude,
          isp: result.org,
          asn: result.asn,
        });
      } catch (err) {
        console.error("IP API Error:", err.message);
        setError(err.message);
        setData(null); // Pastikan data null jika gagal
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { data, loading, error };
};

export default useGetIP;