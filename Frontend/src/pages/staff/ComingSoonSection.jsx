{/* Coming Soon Section - Copy this into Home.jsx */}
<section id="comingsoon" className="py-12 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-xl font-bold text-navy text-center mb-8">Coming Soon</h2>
    
    {loading ? (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy mx-auto"></div>
        <p className="mt-4 text-navy">Loading books...</p>
      </div>
    ) : error ? (
      <div className="text-center text-red-500 py-10">{error}</div>
    ) : comingSoon.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {comingSoon.map(book => (
          <div key={book.id} className="flex flex-col">
            <div className="bg-beige aspect-[2/3] mb-3 flex items-center justify-center relative overflow-hidden">
              <Link to={`/book/${book.id}`} className="w-full h-full">
                <img 
                  src={book.imageUrl || `https://placehold.co/300x450?text=${encodeURIComponent(book.title)}`}
                  alt={book.title}
                  className="object-contain h-full w-full"
                />
                {book.onSaleFlag && (
                  <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-xs font-bold">
                    {book.discountPercentage}% OFF
                  </div>
                )}
                {book.publicationDate && new Date(book.publicationDate) > new Date() && (
                  <div className="absolute bottom-0 left-0 right-0 bg-emerald-700 text-white px-2 py-1 text-xs font-bold text-center">
                    Coming: {new Date(book.publicationDate).toLocaleDateString()}
                  </div>
                )}
              </Link>
              <button 
                onClick={() => handleBookmarkToggle(book)}
                className="absolute top-2 right-2 bg-white p-1.5 rounded-md shadow-md"
                aria-label={bookmarkStates[book.id] ? "Remove from bookmarks" : "Add to bookmarks"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill={bookmarkStates[book.id] ? "#2563EB" : "none"} 
                  viewBox="0 0 24 24" 
                  stroke={bookmarkStates[book.id] ? "#2563EB" : "#1E2B38"} 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
            <div>
              <Link to={`/book/${book.id}`} className="hover:text-gold">
                <h3 className="text-xs font-medium text-navy">{book.title}</h3>
              </Link>
              <p className="text-xs text-gray">{book.author || book.authors?.join(', ') || 'Unknown Author'}</p>
              <div className="flex justify-between items-center mt-2">
                {book.onSaleFlag ? (
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs text-gray-500 line-through">${book.price.toFixed(2)}</span>
                    <span className="text-xs font-bold text-navy">${(book.price * (1 - book.discountPercentage/100)).toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-navy">${(book.price || 0).toFixed(2)}</span>
                )}
                <button 
                  onClick={() => handleAddToCart(book)}
                  className="text-xs bg-navy text-white px-2 py-1 rounded-sm hover:bg-gold hover:text-navy transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center text-navy">No upcoming releases available</div>
    )}
    
    {comingSoon.length > 0 && (
      <div className="mt-8 text-center">
        <Link 
          to="/books?filter=coming-soon" 
          className="inline-block bg-transparent text-navy border border-navy px-6 py-2 rounded-md hover:bg-gold hover:text-white hover:border-gold transition-colors"
        >
          See More Upcoming Books
        </Link>
      </div>
    )}
  </div>
</section>
