Feature: Login Feature

  # Scenario Outline: User should be able to login with valid credentials
  #   Given user fetches db value from "mysql" query "getUsername" and stores as "Username"
  #   And User navigates to "BASE_URL"
  #   When I click on "loginButton"
  #   When User enter "$Username" in "usernameTextbox"
  #   When User enter "<password>" in "passwordTextbox"
  #   When I click on "signinButton"
  #   # When User enters "Pavanol" in "usernameTextbox"
  #   # When User enters username as "<username>" and password as "<password>"
  #   # Then User should be logged in successfully

  #   Examples:
  #     | username | password | result  |
  #     | Pavanol  | test@123 | success |




  # Scenario: User should be able to login with valid credentials

  #   Given User navigates to "AutomationURL"
  #   When I click on "Dropdowncountry"
  #   And user selects index "3" from dropdown "Dropdowncountry"
  #   And element "Texttools" should have text "Text Tools"
    # When User enters "Pavanol" in "usernameTextbox"
    # When User enters username as "<username>" and password as "<password>"
    # Then User should be logged in successfully



  Scenario: User should validate Text

    Given User navigates to "Wordscompare_URL"
    And element "Texttools" should have text "Wordscompare one platform"
    And page title should contain "Free PDF, Calculator"
    And current URL should be "https://www.wordscompare.com/"
    And current URL should contain "wordscompare"
    And page title should be "WordsCompare - Free PDF, Calculator & Text Tools"


