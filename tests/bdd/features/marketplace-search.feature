Feature: Marketplace Search and Filter
  As a visitor or buyer
  I want to find the right SaaS tool quickly
  So that I can evaluate it further

  Background:
    Given I am on the marketplace page

  Scenario: Empty search returns results
    When I load the marketplace without any filters
    Then the page should display product cards
    And the URL should not show an error

  Scenario Outline: Searching by keyword
    When I search for "<keyword>"
    Then I should see results or a no-results message
    And the page should not crash

    Examples:
      | keyword      |
      | crm          |
      | project      |
      | nonexistent999xyz |

  Scenario: Filtering by price type
    When I select the "Free" price filter
    Then all visible products should indicate free pricing

  Scenario: Sorting by rating
    When I select "Top Rated" sort option
    Then products should appear in descending rating order

  Scenario: Clicking a product card navigates to its detail page
    When I click on the first product card
    Then I should be redirected to a URL matching "/marketplace/"
    And the page title should contain the product name

  Scenario: Pagination works correctly
    Given there are more products than fit on one page
    When I click the "Next" pagination button
    Then the page number should increment
    And new products should appear

  Scenario: Mobile viewport shows adapted layout
    Given I am viewing the marketplace on a mobile viewport
    Then the filter sidebar should be collapsed or hidden by default
    And the product grid should be single-column or two-column
