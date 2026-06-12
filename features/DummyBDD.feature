Feature: Login Feature

  Scenario Outline: User should be able to login with valid credentials
    Given user fetches db value from "mysql" query "getUsername" and stores as "Username"
    And User navigates to "BASE_URL" from environment
    When I click on "loginButton"
    When User enter "$Username" in "usernameTextbox"
    When User enter "<password>" in "passwordTextbox"
    When I click on "signinButton"
    # When User enters "Pavanol" in "usernameTextbox"
    # When User enters username as "<username>" and password as "<password>"
    # Then User should be logged in successfully

    Examples:
      | username | password | result  |
      | Pavanol  | test@123 | success |


