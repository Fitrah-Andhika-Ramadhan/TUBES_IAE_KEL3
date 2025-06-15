import React from 'react';
import './Pagination.css';

/**
 * Reusable pagination component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.pagination - Pagination data from API
 * @param {number} props.pagination.current_page - Current page number
 * @param {number} props.pagination.total_pages - Total number of pages
 * @param {boolean} props.pagination.has_next_page - Whether there is a next page
 * @param {boolean} props.pagination.has_prev_page - Whether there is a previous page
 * @param {Function} props.onPageChange - Function to call when page changes
 * @returns {JSX.Element} - Pagination component
 */
const Pagination = ({ pagination, onPageChange }) => {
  // If no pagination data is provided, don't render anything
  if (!pagination) return null;
  
  const { current_page, total_pages, has_next_page, has_prev_page } = pagination;
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    let startPage = Math.max(1, current_page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(total_pages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Generate page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  return (
    <div className="pagination">
      <button 
        className="pagination-button" 
        onClick={() => onPageChange(1)} 
        disabled={!has_prev_page}
      >
        &laquo; First
      </button>
      
      <button 
        className="pagination-button" 
        onClick={() => onPageChange(current_page - 1)} 
        disabled={!has_prev_page}
      >
        &lt; Prev
      </button>
      
      {getPageNumbers().map(page => (
        <button 
          key={page} 
          className={`pagination-button ${page === current_page ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      
      <button 
        className="pagination-button" 
        onClick={() => onPageChange(current_page + 1)} 
        disabled={!has_next_page}
      >
        Next &gt;
      </button>
      
      <button 
        className="pagination-button" 
        onClick={() => onPageChange(total_pages)} 
        disabled={!has_next_page}
      >
        Last &raquo;
      </button>
      
      <div className="pagination-info">
        Page {current_page} of {total_pages}
      </div>
    </div>
  );
};

export default Pagination;
