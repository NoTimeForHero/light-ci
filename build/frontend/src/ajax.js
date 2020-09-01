import axios from 'axios';
import { baseURL } from '@/helpers';

const instance = axios.create({
  baseURL,
  timeout: 5000
});

export default instance;
