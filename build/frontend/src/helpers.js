/* eslint-disable */
export const baseURL = global.__baseURL__ || '/';
export const authURL = global.__authURL__;
/* eslint-enable */

export const mustJSON = (http) => {
  const { data } = http;
  if (typeof data !== 'object') throw new Error('Expected ajax response to be JSON!');
  return data;
};
