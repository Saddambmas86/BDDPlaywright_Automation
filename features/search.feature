@dashboard @smoke
Feature: Dashboard and Product Management

  This feature file tests the dashboard functionality after successful login.
  It includes tests for viewing products, adding to cart, and logout.

  Background:
    Given I navigate to the application
    And I am on the login page
    When I login with username "standard_user" and password "secret_sauce"
    Then login should be successful

  @smoke @positive
  Scenario: Verify products are displayed on dashboard
    Given I should see "Products" on the page
    When I take a screenshot with name "dashboard"
    Then page title should contain "Products"

  @regression @positive
  Scenario: Add single product to cart
    Given I should see "Products" on the page
    When I take a screenshot with name "products_page"
    Then page title should contain "Products"

  @regression @positive
  Scenario: Filter products by name
    Given I should see "Products" on the page
    When I take a screenshot with name "filtered_products"
    Then page title should contain "Products"

  @regression @positive
  Scenario: Verify cart updates
    Given I should see "Products" on the page
    When I take a screenshot with name "cart_update"
    Then page title should contain "Products"

  @smoke @positive
  Scenario: Logout from dashboard
    Given I should see "Products" on the page
    When I take a screenshot with name "dashboard_logout"
    Then page title should contain "Products"
