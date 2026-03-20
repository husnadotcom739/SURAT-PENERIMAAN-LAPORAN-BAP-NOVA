import { useState, useEffect } from 'react';

const usePreciseLocation = () => {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("User menolak izin lokasi atau error:", error);
          setCoords("DENIED"); // Tandai jika user menolak
        },
        { enableHighAccuracy: true } // Memaksa GPS aktif jika ada
      );
    }
  }, []);

  return coords;
};

export default usePreciseLocation;