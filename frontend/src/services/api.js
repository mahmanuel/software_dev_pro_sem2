import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Backend endpoint

export const fetchIssues = async () => {
  const response = await axios.get(`${API_BASE_URL}/issues/`);
  return response.data;
};

export const createIssue = async (issueData) => {
  const response = await axios.post(`${API_BASE_URL}/issues/`, issueData);
  return response.data;
};
