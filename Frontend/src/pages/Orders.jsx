import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import bookService from '../services/bookService';
import { Calendar, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // track which review form is open and its inputs/errors
  const [reviewForms, setReviewForms] = useState({});
  // cache reviews per bookId
  const [reviewsByBook, setReviewsByBook] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!isAuthenticated()) {
          navigate('/login', { state: { from: '/orders' } });
          return;
        }
        
        // Get orders from database via API
        const ordersData = await orderService.getUserOrders();
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [isAuthenticated, navigate]);

  // ─── Prefetch reviews for all completed‐order books ─────────────────
  useEffect(() => {
    if (loading) return;
    // collect all bookIds from completed orders
    const completedBookIds = orders
      .filter(o => o.status === 1)
      .flatMap(o => o.orderItems.map(i => i.bookId));
    const uniqueIds = Array.from(new Set(completedBookIds));

    uniqueIds.forEach(bookId => {
      bookService
        .getBookReviews(bookId)
        .then(data =>
          setReviewsByBook(prev => ({ ...prev, [bookId]: data }))
        )
        .catch(err =>
          console.error('Failed to load reviews for book', bookId, err)
        );
    });
  }, [loading, orders]);
  
  // Helpers for review form
  const openReviewForm = (bookId) => {
    setReviewForms(prev => ({
      ...prev,
      [bookId]: { show: true, rating: 5, comment: '', error: '' }
    }));
  };

  const handleReviewInputChange = (bookId, field, value) => {
    setReviewForms(prev => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        [field]: value
      }
    }));
  };

  const handleReviewSubmit = async (e, bookId) => {
    e.preventDefault();
    const { rating, comment } = reviewForms[bookId];
    try {
      await bookService.postReview(bookId, { rating, comment });
      // close the form on success
      setReviewForms(prev => ({
        ...prev,
        [bookId]: { ...prev[bookId], show: false }
      }));
    } catch (err) {
      console.error('Review submission error:', err);
      setReviewForms(prev => ({
        ...prev,
        [bookId]: {
          ...prev[bookId],
          error: err.response?.data?.error || 'Failed to submit review'
        }
      }));
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 0: // Pending
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 1: // Completed
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      case 2: // Cancelled
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrderId(null);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    
    try {
      await orderService.cancelOrder(selectedOrderId);
      
      // Update the order status in the state
      setOrders(orders.map(order => 
        order.id === selectedOrderId 
          ? { ...order, status: 2, isCancelled: true, cancellationDate: new Date().toISOString() } 
          : order
      ));
      
      // Close the modal
      closeCancelModal();
    } catch (err) {
      console.error('Error cancelling order:', err);
      // We'll handle the error in the UI rather than using alert
      setError('Failed to cancel order. Please try again.');
      closeCancelModal();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-beige">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-navy">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-beige">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-8 text-navy">Your Orders</h1>
        
        {error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p>{error}</p>
              </div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <h2 className="text-xl font-bold mb-4 text-navy">No Orders Found</h2>
            <p className="text-gray mb-6">You haven't placed any orders yet.</p>
            <Link 
              to="/" 
              className="bg-navy text-white py-2 px-4 rounded-md font-medium hover:bg-gold hover:text-navy transition-colors"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <h2 className="text-lg font-bold text-navy mr-3">Order #{order.id}</h2>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center text-gray text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Placed on {formatDate(order.orderDate)}</span>
                      </div>
                      {order.isCancelled && order.cancellationDate && (
                        <div className="flex items-center text-red-600 text-sm mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Cancelled on {formatDate(order.cancellationDate)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray">Total Amount:</p>
                      <p className="font-bold text-navy text-lg">${order.totalAmount.toFixed(2)}</p>
                      {order.discountAmount > 0 && (
                        <p className="text-xs text-green-600">
                          You saved ${order.discountAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-b border-gray-200 py-4 my-4">
                    <div className="flex items-center mb-2">
                      <p className="text-sm font-medium text-navy">Claim Code:</p>
                      <p className="ml-2 font-mono text-navy">{order.claimCode}</p>
                    </div>
                    
                    <p className="text-sm text-gray">
                      {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 justify-between items-center">
                    <Link 
                      to={`/order-confirmation/${order.id}`}
                      className="flex items-center text-navy hover:text-gold transition-colors"
                    >
                      View Order Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                    
                    {order.status === 0 && !order.isCancelled && (
                      <button 
                        onClick={() => openCancelModal(order.id)}
                        className="text-red-600 hover:text-red-800 transition-colors text-sm"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Preview of order items */}
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex overflow-x-auto space-x-4 pb-2">
                    {order.orderItems.slice(0, 4).map(item => (
                      <div key={item.id} className="flex-shrink-0 w-16">
                        <img 
                          src={item.bookImageUrl || '/placeholder-book.png'} 
                          alt={item.bookTitle} 
                          className="w-16 h-20 object-cover rounded-md shadow-sm"
                        />
                      </div>
                    ))}
                    {order.orderItems.length > 4 && (
                      <div className="flex-shrink-0 w-16 h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray">
                        +{order.orderItems.length - 4} more
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── REVIEW SECTION ───────────────────────────────────────── */}
                {order.status === 1 && (
                  <div className="p-6 border-t border-gray-200">
                    <h3 className="font-medium text-navy mb-4">Leave Reviews</h3>
                    <div className="space-y-4">
                      {order.orderItems.map(item => {
                        // ★ compute if user already reviewed this book
                        const reviewsForThis = reviewsByBook[item.bookId] || [];
                        const alreadyReviewed = reviewsForThis.some(r => r.userId === user?.id);

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={item.bookImageUrl || '/placeholder-book.png'}
                                alt={item.bookTitle}
                                className="w-12 h-16 object-cover rounded"
                              />
                              <span className="text-navy">{item.bookTitle}</span>
                            </div>

                            {reviewForms[item.bookId]?.show ? (
                              /* ── your existing form JSX ── */
                              <form
                                onSubmit={e => handleReviewSubmit(e, item.bookId)}
                                className="flex flex-col gap-2 w-full md:w-auto"
                              >
                                {reviewForms[item.bookId].error && (
                                  <p className="text-red-500">{reviewForms[item.bookId].error}</p>
                                )}
                                <div>
                                  <label className="block text-sm mb-1">Rating</label>
                                  <select
                                    className="border rounded px-2 py-1"
                                    value={reviewForms[item.bookId].rating}
                                    onChange={e =>
                                      handleReviewInputChange(item.bookId, 'rating', +e.target.value)
                                    }
                                  >
                                    {[1, 2, 3, 4, 5].map(n => (
                                      <option key={n} value={n}>{n}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm mb-1">Comment</label>
                                  <textarea
                                    className="w-full border rounded p-2"
                                    rows={2}
                                    value={reviewForms[item.bookId].comment}
                                    onChange={e =>
                                      handleReviewInputChange(item.bookId, 'comment', e.target.value)
                                    }
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="self-end bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition"
                                >
                                  Submit Review
                                </button>
                              </form>
                            ) : alreadyReviewed ? (
                              // ★ if already reviewed, show a message
                              <p className="text-gray-600 text-sm">
                                You have already reviewed this book.
                              </p>
                            ) : (
                              // ★ otherwise show the Leave Review button
                              <button
                                onClick={() => openReviewForm(item.bookId)}
                                className="bg-navy text-white px-4 py-2 rounded-md hover:bg-gold hover:text-navy transition"
                              >
                                Leave Review
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* ─── END REVIEW SECTION ─────────────────────────────────────── */}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={closeCancelModal}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep Order"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}

export default Orders;
