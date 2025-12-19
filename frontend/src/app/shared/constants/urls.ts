const BASE_URL = 'http://localhost:7000';

export const FOODS_URL = BASE_URL + '/api/foods';
export const FOODS_TAGS_URL = FOODS_URL + '/tags';
export const FOODS_BY_SEARCH_URL = FOODS_URL + '/search/';
export const FOODS_BY_TAG_URL = FOODS_URL + '/tag/';
export const FOODS_BY_ID_URL = FOODS_URL + '/';

export const USER_LOGIN_URL = BASE_URL + '/api/users/login';
export const USER_REGISTER_URL = BASE_URL + '/api/users/register';
export const USER_ALL_URL = BASE_URL + '/api/users/all'; // Admin only - all users except logged-in

export const ORDER_URL = BASE_URL + '/api/orders';
export const ORDER_CREATE_URL = ORDER_URL + '/create';
export const ORDER_NEW_FOR_CURRENT_USER_URL = ORDER_URL + '/newOrderForCurrentUser';
export const ORDER_PAY_URL = ORDER_URL + '/pay';
export const ORDER_TRACK_URL = ORDER_URL + '/track/';
export const ORDER_RAZORPAY_CREATE_URL = ORDER_URL + '/create-razorpay-order';
export const ORDER_RAZORPAY_VERIFY_URL = ORDER_URL + '/verify-razorpay-payment';

// ✅ NEW:
export const ORDER_MY_ORDERS_URL = ORDER_URL + '/myOrders';

export const WISHLIST_URL = BASE_URL + '/api/wishlist';
export const WISHLIST_MY_URL = WISHLIST_URL + '/my-wishlist';
export const WISHLIST_ADD_URL = WISHLIST_URL + '/add/';
export const WISHLIST_REMOVE_URL = WISHLIST_URL + '/remove/';
export const WISHLIST_CHECK_URL = WISHLIST_URL + '/check/';

export const ANALYTICS_URL = BASE_URL + '/api/analytics';
export const ANALYTICS_DASHBOARD_URL = ANALYTICS_URL + '/dashboard';

