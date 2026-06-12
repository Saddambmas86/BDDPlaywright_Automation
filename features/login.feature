@login @smoke
Feature: Login Functionality

  This feature file tests the login functionality of the application.
  It includes positive and negative test cases for login scenarios.

  Background:
    Given I navigate to the application

  @smoke @positive
  Scenario: Successful login with valid credentials
    Given I am on the "login" page
    When I fill in "username" with "standard_user"
    And I fill in "password" with "secret_sauce"
    And I click on "loginButton"
    Then login should be successful
    And I should see "Products"

#   @smoke @positive
#   Scenario Outline: Login with different valid users
#     Given I am on the login page
#     When I login with username "<username>" and password "<password>"
#     Then login should be successful
#     And I should see "Products"

#     Examples:
#       | username                | password      |
#       | standard_user           | secret_sauce  |
#       | locked_out_user         | secret_sauce  |
#       | problem_user            | secret_sauce  |
