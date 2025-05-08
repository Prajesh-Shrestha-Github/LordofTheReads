import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellRing } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getAllAnnouncements } from '../services/announcementService';

function Notifications() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await getAllAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-beige">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy flex items-center">
            <BellRing className="mr-2" /> Notifications
          </h1>
          <p className="text-gray-600 mt-2">
            Stay updated with the latest announcements and news from Lord of the Reads
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-md">
            {error}
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white p-8 rounded-md shadow-sm text-center">
            <BellRing size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-navy mb-2">No Notifications</h2>
            <p className="text-gray-600">
              There are currently no announcements. Check back later for updates!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white p-6 rounded-md shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-navy">{announcement.title}</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Posted on {formatDate(announcement.startDate)}
                    </p>
                  </div>
                  <div className="bg-gold text-navy px-2 py-1 text-xs rounded-full">
                    Announcement
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-700">{announcement.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default Notifications;
