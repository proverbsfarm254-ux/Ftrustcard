// Authentication Guard - Protects pages from unauthorized access
(function() {
  'use strict';

  // Pages that require authentication (exclude login and index pages)
  const PROTECTED_PAGES = [
    'admin.html',
  ];

  // Check if current page requires authentication
  function isProtectedPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    return PROTECTED_PAGES.includes(currentPage);
  }

    // User login removed. Only admin-login logic remains. No user authentication or redirects.

})();
