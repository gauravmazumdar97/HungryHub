const BASE_URL = 'http://localhost:9000';

export const FOODS_URL = BASE_URL + '/api/foods';
export const FOODS_TAGS_URL = FOODS_URL + '/tags';
export const FOODS_BY_SEARCH_URL = FOODS_URL + '/search/';
export const FOODS_BY_TAG_URL = FOODS_URL + '/tag/';
export const FOODS_BY_ID_URL = FOODS_URL + '/';

export const USER_LOGIN_URL = BASE_URL + '/api/users/login';
export const USER_REGISTER_URL = BASE_URL + '/api/users/register';

export const ORDER_URL = BASE_URL + '/api/orders';

export const WISHLIST_URL = BASE_URL + '/api/wishlist';
export const WISHLIST_MY_URL = WISHLIST_URL + '/my-wishlist';
export const WISHLIST_ADD_URL = WISHLIST_URL + '/add/';
export const WISHLIST_REMOVE_URL = WISHLIST_URL + '/remove/';
export const WISHLIST_CHECK_URL = WISHLIST_URL + '/check/';

export const ANALYTICS_URL = BASE_URL + '/api/analytics';
export const ANALYTICS_DASHBOARD_URL = ANALYTICS_URL + '/dashboard';