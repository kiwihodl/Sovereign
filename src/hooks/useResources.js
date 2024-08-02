import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchResources = async () => {
  const { data } = await axios.get('/api/resources');
  return data;
};

export const useResources = () => {
  return useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources,
  });
};