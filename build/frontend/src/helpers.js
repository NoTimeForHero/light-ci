// eslint-disable-next-line
export const baseURL = global.__baseURL__ || '/';

export const mustJSON = (http) => {
  const { data } = http;
  if (typeof data !== 'object') throw new Error('Expected ajax response to be JSON!');
  return data;
};
