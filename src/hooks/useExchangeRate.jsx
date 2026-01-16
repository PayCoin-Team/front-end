import { useState, useEffect } from 'react';
import axios from 'axios';

const useExchangeRate = () => {
  const [rate, setRate] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=krw'
        );
 
        const krwPrice = response.data.tether.krw;
        setRate(krwPrice);
        setLoading(false);

      } catch (err) {
        console.error("환율 로딩 실패:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchRate();

    // 1분(60000ms)마다 갱신 
    const interval = setInterval(fetchRate, 10000);
    return () => clearInterval(interval);

  }, []);

  return { rate, loading, error };
};

export default useExchangeRate;