import 'dotenv/config';

export const config = {
  uiBaseUrl: process.env.UI_BASE_URL ??
    'https://eventhub.rahulshettyacademy.com/',

  apiBaseUrl: process.env.API_BASE_URL ??
    'https://api.eventhub.rahulshettyacademy.com/api/'
};