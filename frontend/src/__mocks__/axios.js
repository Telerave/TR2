   // __mocks__/axios.js
   export default {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    // добавьте другие методы по необходимости
  };