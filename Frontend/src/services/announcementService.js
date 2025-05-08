import api from './api';

// Get all active announcements
const getAllAnnouncements = async () => {
  try {
    const response = await api.get('/announcements');
    return response.data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

// Get latest active announcement
const getLatestAnnouncement = async () => {
  try {
    const response = await api.get('/announcements/latest');
    return response.data;
  } catch (error) {
    console.error('Error fetching latest announcement:', error);
    // Return null instead of throwing, so components can handle no announcements gracefully
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

// Export functions
export { getAllAnnouncements, getLatestAnnouncement };

// Default export for backward compatibility
const announcementService = {
  getAllAnnouncements,
  getLatestAnnouncement
};

export default announcementService;
