Feature: Vendor Onboarding and Management Journey
  As a SaaS vendor
  I want to list my product and manage its presence
  So that I can reach potential buyers

  Background:
    Given the Moonmart application is running

  Scenario: Vendor registers an account
    When I navigate to "/signup"
    And I fill in a valid email and password
    And I select "Vendor" as my account type
    And I submit the registration form
    Then I should be redirected to the onboarding flow
    And I should see a confirmation message

  Scenario: Vendor logs in and sees their dashboard
    Given I am logged in as a vendor
    When I navigate to "/dashboard"
    Then I should see dashboard analytics or a setup prompt

  Scenario: Vendor cannot access admin panel
    Given I am logged in as a vendor
    When I navigate to "/admin"
    Then I should be redirected away from the admin page
    And I should see an access denied message

  Scenario: Vendor sees their product in the marketplace
    Given I am logged in as a vendor
    And my product is listed and published
    When I navigate to the marketplace and search for my product name
    Then my product should appear in the results

  Scenario: Vendor views pricing comparison page
    When I navigate to "/pricing"
    Then the pricing page should load
    And I should see at least one pricing tier

  Scenario: Vendor checks the roadmap for upcoming features
    When I navigate to "/roadmap"
    Then I should see roadmap items grouped by quarter
    And each item should display a status badge
