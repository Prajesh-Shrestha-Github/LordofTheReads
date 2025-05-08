import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getLatestAnnouncement } from '../services/announcementService';

function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestAnnouncement = async () => {
      try {
        setLoading(true);
        const data = await getLatestAnnouncement();
        setAnnouncement(data);
      } catch (error) {
        console.error('Error fetching announcement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAnnouncement();
  }, []);

  if (loading || !announcement || !visible) {
    return null;
  }

  return (
    <div className="bg-gold text-navy px-4 py-3 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 pr-10">
          <p className="font-semibold">{announcement.title}</p>
          <p className="text-sm mt-1">{announcement.content}</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-3 text-navy hover:text-gray-800"
          aria-label="Close announcement"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

export default AnnouncementBanner;
