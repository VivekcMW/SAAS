Feature: Authentication Flows
  As a user
  I want to securely register, log in, and manage my session
  So that my data is protected

  Scenario: Successful registration with valid details
    Given I am on the registration page
    When I enter a unique email address
    And I enter a strong password
    And I submit the form
    Then I should be redirected or shown a success state
    And I should not see a raw server error

  Scenario: Registration fails with duplicate email
    Given I am on the registration page
    When I enter an email that is already registered
    And I enter any password
    And I submit the form
    Then I should see an error message about the email being taken

  Scenario: Registration fails with weak password
    Given I am on the registration page
    When I enter a valid email address
    And I enter the password "123"
    And I submit the form
    Then I should see a validation error

  Scenario: Login with correct credentials succeeds
    Given a user account exists with known credentials
    When I navigate to the login page
    And I enter the correct email and password
    And I submit the login form
    Then I should be redirected to the dashboard

  Scenario: Login with wrong password is rejected
    When I navigate to the login page
    And I enter "test@example.com" as the email
    And I enter "wrongpassword" as the password
    And I submit the login form
    Then I should remain on the login page
    And I should see an authentication error message

  Scenario: Login page has no XSS vulnerability
    When I navigate to the login page
    And I enter "<script>alert(1)</script>" in the email field
    And I submit the form
    Then no alert dialog should appear
    And the page should remain functional

  Scenario: Password field is masked
    When I navigate to the login page
    Then the password input type should be "password"

  Scenario: Logged-in user cannot see login page again
    Given I am logged in as a buyer
    When I navigate to "/login"
    Then I should be redirected away from the login page

  Scenario: User can log out
    Given I am logged in as a buyer
    When I click the logout button
    Then I should be redirected to the homepage or login page
    And I should no longer see authenticated navigation items
