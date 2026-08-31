import client from './client';

// Ecommerce (public)
export const listProducts = (params) => client.get('/products', { params }).then((r) => r.data.data);
export const getProductBySlug = (slug) => client.get(`/products/${slug}`).then((r) => r.data.data);

// Packages (public)
export const listPackages = () => client.get('/packages').then((r) => r.data.data);

// CMS (public)
export const getCmsPage = (slug) => client.get(`/cms/pages/${slug}`).then((r) => r.data.data);
export const listFaqs = () => client.get('/faqs').then((r) => r.data.data);
export const listSocialLinks = () => client.get('/social-links').then((r) => r.data.data);
export const getHomeVideo = () => client.get('/site-settings/home-video').then((r) => r.data.data);

// Get in touch (public)
export const submitContactForm = (payload) => client.post('/contact-us', payload).then((r) => r.data.data);

// Education (public)
export const listGameCategories = () => client.get('/game-categories').then((r) => r.data.data);
export const verifySchoolCode = (code) => client.get(`/schools/verify/${code}`).then((r) => r.data.data);

// Contact info (public)
export const getContactInfo = () => client.get('/site-settings/contact-info').then((r) => r.data.data);

// Schools (public)
export const listSchools = () => client.get('/schools').then((r) => r.data.data);
export const listSchoolGames = (schoolId) => client.get(`/schools/${schoolId}/games`).then((r) => r.data.data);

// Checkout (public — works for guests and logged-in users)
export const checkoutRequest = (payload) => client.post('/orders', payload).then((r) => r.data.data);
