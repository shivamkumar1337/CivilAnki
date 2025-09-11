import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL 

export const HomeService = {
async getProfile(accessToken: string) {
  console.log("API_BASE:", API_BASE);
  console.log("HomeService: Fetching pofile with accessToken:", accessToken);
  try {
    const res = await axios.get(`${API_BASE}/profiles`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("Profile data:", res);
    return res.data;
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
},
  async getSubjects(accessToken: string) {
    // console.log("API_BASE:", API_BASE);
    // console.log("HomeService: Fetching subjects with accessToken:", accessToken);
    const res = await axios.get(`${API_BASE}/subjects`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  },
};