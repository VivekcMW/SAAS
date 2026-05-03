Feature: Buyer Discovery Journey
  As a software buyer
  I want to discover, compare, and research SaaS tools
  So that I can make informed purchasing decisions

  Background:
    Given I am on the Moonmart homepage

  Scenario: Buyer searches for a CRM tool
    When I navigate to the marketplace
    And I type "crm" into the search bar
    Then I should see at least one search result
    And each result should display a name and rating

  Scenario: Buyer filters by category
    When I navigate to the marketplace
    And I click on the "CRM" category
    Then the page URL should include a category parameter
    And the displayed products should be relevant to CRM

  Scenario: Buyer reads a product page
    When I navigate to the marketplace
    And I click on the first visible product card
    Then I should be on a product detail page
    And I should see a product description
    And I should see a reviews section

  Scenario: Buyer compares two products
    When I navigate to the marketplace
    And I select "Compare" on two products
    Then I should see a comparison view
    And the comparison should show both product names side by side

  Scenario: Buyer adds a tool to their stack
    Given I am logged in as a buyer
    When I navigate to a product detail page
    And I click "Add to Stack"
    Then the tool should appear in my dashboard stack

  Scenario: Buyer reads a guide before buying
    When I navigate to "/guides"
    Then I should see a list of guide articles
    And each guide should show a title, category, and read time
    When I click on a guide
    Then I should be on the guide detail page

  Scenario: Anonymous buyer sees the changelog
    When I navigate to "/changelog"
    Then the page should load without errors
    And I should see the changelog heading
