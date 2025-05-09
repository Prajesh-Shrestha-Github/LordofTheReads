import api from './api';

// Local storage key for read announcements
const READ_ANNOUNCEMENTS_KEY = 'lordOfTheReads_readAnnouncements';

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

// Get read announcement IDs from localStorage
const getReadAnnouncementIds = () => {
  try {
    const readAnnouncements = localStorage.getItem(READ_ANNOUNCEMENTS_KEY);
    return readAnnouncements ? JSON.parse(readAnnouncements) : [];
  } catch (error) {
    console.error('Error getting read announcements:', error);
    return [];
  }
};

// Mark an announcement as read
const markAnnouncementAsRead = (announcementId) => {
  try {
    const readAnnouncements = getReadAnnouncementIds();
    if (!readAnnouncements.includes(announcementId)) {
      readAnnouncements.push(announcementId);
      localStorage.setItem(READ_ANNOUNCEMENTS_KEY, JSON.stringify(readAnnouncements));
      // Dispatch event to notify components about the update
      window.dispatchEvent(new CustomEvent('announcementsUpdated'));
    }
  } catch (error) {
    console.error('Error marking announcement as read:', error);
  }
};

// Mark all announcements as read
const markAllAnnouncementsAsRead = async () => {
  try {
    const announcements = await getAllAnnouncements();
    const announcementIds = announcements.map(a => a.id);
    localStorage.setItem(READ_ANNOUNCEMENTS_KEY, JSON.stringify(announcementIds));
    // Dispatch event to notify components about the update
    window.dispatchEvent(new CustomEvent('announcementsUpdated'));
  } catch (error) {
    console.error('Error marking all announcements as read:', error);
  }
};

// Get unread announcements count
const getUnreadAnnouncementsCount = async () => {
  try {
    const announcements = await getAllAnnouncements();
    const readAnnouncementIds = getReadAnnouncementIds();
    const unreadCount = announcements.filter(a => !readAnnouncementIds.includes(a.id)).length;
    return unreadCount;
  } catch (error) {
    console.error('Error getting unread announcements count:', error);
    return 0;
  }
};

// Export functions
export { 
  getAllAnnouncements, 
  getLatestAnnouncement, 
  getUnreadAnnouncementsCount, 
  markAnnouncementAsRead, 
  markAllAnnouncementsAsRead,
  getReadAnnouncementIds
};

// Default export for backward compatibility
const announcementService = {
  getAllAnnouncements,
  getLatestAnnouncement,
  getUnreadAnnouncementsCount,
  markAnnouncementAsRead,
  markAllAnnouncementsAsRead,
  getReadAnnouncementIds
};

export default announcementService;
