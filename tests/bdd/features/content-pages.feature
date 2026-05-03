Feature: Content Pages — Changelog, Roadmap, Guides, Careers
  As a visitor
  I want to read product updates, upcoming features, guides, and job listings
  So that I can stay informed about Moonmart

  Scenario: Changelog page loads and shows type filters
    When I navigate to "/changelog"
    Then I should see the heading "Changelog"
    And I should see filter buttons including "Feature" and "Fix"
    When there are no changelog entries
    Then I should see an empty state message

  Scenario: Filtering changelog by type
    Given the changelog has entries of type "feature" and "fix"
    When I navigate to "/changelog"
    And I click the "Feature" filter
    Then only feature entries should be visible

  Scenario: Roadmap page shows quarter groupings
    When I navigate to "/roadmap"
    Then I should see the heading "Roadmap"
    And roadmap items should be grouped by quarter headings

  Scenario: Voting on a roadmap item
    When I navigate to "/roadmap"
    And I click the vote button on a roadmap item
    Then the vote count should increase by 1
    And the vote button should appear highlighted

  Scenario: Voting twice on the same item is idempotent
    When I navigate to "/roadmap"
    And I click the vote button on the same roadmap item twice
    Then the vote count should only increase by 1

  Scenario: Guides page shows category sidebar and guide cards
    When I navigate to "/guides"
    Then I should see the heading containing "Guides"
    And I should see category filter options
    And each guide card should display a title and excerpt

  Scenario: Filtering guides by category
    When I navigate to "/guides"
    And I click the "Buyer Tips" category filter
    Then only buyer tips guides should be visible

  Scenario: Navigating to a guide detail page
    Given there is a published guide with slug "how-to-buy-crm"
    When I navigate to "/guides/how-to-buy-crm"
    Then I should see the guide title
    And I should see a "Back to all guides" link

  Scenario: Careers page shows open roles
    When I navigate to "/careers"
    Then I should see the heading "Join Our Team"
    And I should see job listing cards with department badges

  Scenario: Filtering careers by department
    When I navigate to "/careers"
    And I click the "Engineering" department filter
    Then only engineering jobs should be visible

  Scenario: Careers shows apply button for jobs with apply URL
    When I navigate to "/careers"
    Then job cards with an apply URL should show an "Apply Now" button

  Scenario: Non-existent guide returns 404
    When I navigate to "/guides/this-slug-does-not-exist"
    Then I should see an error state or 404 message
