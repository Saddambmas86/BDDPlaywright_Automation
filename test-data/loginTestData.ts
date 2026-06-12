/**
 * Test Data for Login Tests
 * 
 * This file contains test data used across login test scenarios.
 * Centralized test data management makes it easy to update test cases.
 */

export const testData = {
  // Valid credentials
  validUsers: [
    {
      username: 'standard_user',
      password: 'secret_sauce',
      expectedResult: 'success',
    },
    {
      username: 'locked_out_user',
      password: 'secret_sauce',
      expectedResult: 'locked',
    },
    {
      username: 'problem_user',
      password: 'secret_sauce',
      expectedResult: 'success',
    },
  ],

  // Invalid credentials
  invalidUsers: [
    {
      username: 'invalid_user',
      password: 'secret_sauce',
      expectedError: 'Username and password do not match',
    },
    {
      username: 'standard_user',
      password: 'wrong_password',
      expectedError: 'Username and password do not match',
    },
  ],

  // Empty fields
  emptyFields: [
    {
      username: '',
      password: 'secret_sauce',
      expectedError: 'Username is required',
    },
    {
      username: 'standard_user',
      password: '',
      expectedError: 'Password is required',
    },
    {
      username: '',
      password: '',
      expectedError: 'Username is required',
    },
  ],

  // Messages
  messages: {
    loginSuccess: 'Products',
    loginError: 'Epic sadface:',
    usernameRequired: 'Username is required',
    passwordRequired: 'Password is required',
    credentialsError: 'Username and password do not match',
  },
};

export default testData;
