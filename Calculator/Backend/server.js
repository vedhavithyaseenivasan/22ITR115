const express = require('express');
const axios = require('axios');
const app = express();
const port = 9999;

const windowSize = 10; 
let storedNumbers = []; 


const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return (sum / numbers.length).toFixed(2); 
};

const fetchNumbersFromAPI = async (numberId) => {
  let url;
  switch (numberId) {
    case 'p':
      url = 'http://20.244.56.144/evaluation-service/primes';
      break;
    case 'f':
      url = 'http://20.244.56.144/evaluation-service/fibo';
      break;
    case 'e': 
      url = 'http://20.244.56.144/evaluation-service/even';
      break;
    case 'r': 
      url = 'http://20.244.56.144/evaluation-service/rand';
      break;
    default:
      throw new Error('Invalid number ID');
  }
  try {
    const response = await axios.get(url, { timeout: 500 }); 
    return response.data.numbers || [];
  } catch (error) {
    console.error('Error fetching numbers:', error.message);
    return [];
  }
};

app.get('/numbers/:numberid', async (req, res) => {
  const numberId = req.params.numberid;

  try {
    const newNumbers = await fetchNumbersFromAPI(numberId);
    if (newNumbers.length === 0) {
      return res.status(500).json({
        message: 'No valid numbers returned or timeout exceeded.',
      });
    }
    const uniqueNewNumbers = [...new Set([...storedNumbers, ...newNumbers])];
    if (uniqueNewNumbers.length > windowSize) {
      uniqueNewNumbers.length = windowSize;
    }
    const avg = calculateAverage(uniqueNewNumbers);
    return res.json({
      windowPrevState: storedNumbers, 
      windowCurrState: uniqueNewNumbers,
      numbers: newNumbers, 
      avg,
    });
    storedNumbers=uniqueNewNumbers;
  } catch (error) {
    return res.status(500).json({
      message: 'Server error: ' + error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});