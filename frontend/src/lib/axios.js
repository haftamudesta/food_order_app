import axios from 'axios';
import qs from 'qs';

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials:true,
  // Qs configuration for params serialization
  paramsSerializer: (params) => qs.stringify(params,{arrayFormat:'repeat'})
})

export default axiosInstance