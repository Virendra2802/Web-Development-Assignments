import { useState, useEffect } from 'react';
import axios from 'axios';

const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const storedUser = localStorage.getItem('axia_user');
      if (!storedUser) return;
      const user = JSON.parse(storedUser);
      const userId = user.id || user._id;

      const res = await axios.get(`http://localhost:5000/api/transactions?userId=${userId}`);
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Listen for lightweight custom event fired by Quick Add / Expense Modal
    // instead of doing a full window.location.reload()
    window.addEventListener('axia:transactions-updated', fetchTransactions);
    return () => {
      window.removeEventListener('axia:transactions-updated', fetchTransactions);
    };
  }, []);

  return { transactions, loading, fetchTransactions };
};

export default useTransactions;
