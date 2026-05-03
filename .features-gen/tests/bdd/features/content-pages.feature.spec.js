// Generated from: tests/bdd/features/content-pages.feature
import { test } from "playwright-bdd";

test.describe('Content Pages — Changelog, Roadmap, Guides, Careers', () => {

  test('Changelog page loads and shows type filters', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/changelog"', null, { page }); 
    await Then('I should see the heading "Changelog"', null, { page }); 
    await And('I should see filter buttons including "Feature" and "Fix"', null, { page }); 
    await When('there are no changelog entries'); 
    await Then('I should see an empty state message', null, { page }); 
  });

  test('Filtering changelog by type', async ({ Given, When, Then, And, page }) => { 
    await Given('the changelog has entries of type "feature" and "fix"'); 
    await When('I navigate to "/changelog"', null, { page }); 
    await And('I click the "Feature" filter', null, { page }); 
    await Then('only feature entries should be visible', null, { page }); 
  });

  test('Roadmap page shows quarter groupings', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/roadmap"', null, { page }); 
    await Then('I should see the heading "Roadmap"', null, { page }); 
    await And('roadmap items should be grouped by quarter headings', null, { page }); 
  });

  test('Voting on a roadmap item', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/roadmap"', null, { page }); 
    await And('I click the vote button on a roadmap item', null, { page }); 
    await Then('the vote count should increase by 1', null, { page }); 
    await And('the vote button should appear highlighted', null, { page }); 
  });

  test('Voting twice on the same item is idempotent', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/roadmap"', null, { page }); 
    await And('I click the vote button on the same roadmap item twice', null, { page }); 
    await Then('the vote count should only increase by 1', null, { page }); 
  });

  test('Guides page shows category sidebar and guide cards', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/guides"', null, { page }); 
    await Then('I should see the heading containing "Guides"', null, { page }); 
    await And('I should see category filter options', null, { page }); 
    await And('each guide card should display a title and excerpt', null, { page }); 
  });

  test('Filtering guides by category', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/guides"', null, { page }); 
    await And('I click the "Buyer Tips" category filter', null, { page }); 
    await Then('only buyer tips guides should be visible', null, { page }); 
  });

  test('Navigating to a guide detail page', async ({ Given, When, Then, And, page }) => { 
    await Given('there is a published guide with slug "how-to-buy-crm"'); 
    await When('I navigate to "/guides/how-to-buy-crm"', null, { page }); 
    await Then('I should see the guide title', null, { page }); 
    await And('I should see a "Back to all guides" link', null, { page }); 
  });

  test('Careers page shows open roles', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/careers"', null, { page }); 
    await Then('I should see the heading "Join Our Team"', null, { page }); 
    await And('I should see job listing cards with department badges', null, { page }); 
  });

  test('Filtering careers by department', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/careers"', null, { page }); 
    await And('I click the "Engineering" department filter', null, { page }); 
    await Then('only engineering jobs should be visible', null, { page }); 
  });

  test('Careers shows apply button for jobs with apply URL', async ({ When, Then, page }) => { 
    await When('I navigate to "/careers"', null, { page }); 
    await Then('job cards with an apply URL should show an "Apply Now" button', null, { page }); 
  });

  test('Non-existent guide returns 404', async ({ When, Then, page }) => { 
    await When('I navigate to "/guides/this-slug-does-not-exist"', null, { page }); 
    await Then('I should see an error state or 404 message', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/bdd/features/content-pages.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"When I navigate to \"/changelog\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/changelog\"","children":[{"start":15,"value":"/changelog","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then I should see the heading \"Changelog\"","stepMatchArguments":[{"group":{"start":25,"value":"\"Changelog\"","children":[{"start":26,"value":"Changelog","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And I should see filter buttons including \"Feature\" and \"Fix\"","stepMatchArguments":[{"group":{"start":38,"value":"\"Feature\"","children":[{"start":39,"value":"Feature","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":52,"value":"\"Fix\"","children":[{"start":53,"value":"Fix","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"When there are no changelog entries","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then I should see an empty state message","stepMatchArguments":[]}]},
  {"pwTestLine":14,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Context","textWithKeyword":"Given the changelog has entries of type \"feature\" and \"fix\"","stepMatchArguments":[{"group":{"start":34,"value":"\"feature\"","children":[{"start":35,"value":"feature","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":48,"value":"\"fix\"","children":[{"start":49,"value":"fix","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I navigate to \"/changelog\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/changelog\"","children":[{"start":15,"value":"/changelog","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"And I click the \"Feature\" filter","stepMatchArguments":[{"group":{"start":12,"value":"\"Feature\"","children":[{"start":13,"value":"Feature","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"Then only feature entries should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":21,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":22,"gherkinStepLine":20,"keywordType":"Action","textWithKeyword":"When I navigate to \"/roadmap\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/roadmap\"","children":[{"start":15,"value":"/roadmap","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":23,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"Then I should see the heading \"Roadmap\"","stepMatchArguments":[{"group":{"start":25,"value":"\"Roadmap\"","children":[{"start":26,"value":"Roadmap","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":24,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"And roadmap items should be grouped by quarter headings","stepMatchArguments":[]}]},
  {"pwTestLine":27,"pickleLine":24,"tags":[],"steps":[{"pwStepLine":28,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"When I navigate to \"/roadmap\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/roadmap\"","children":[{"start":15,"value":"/roadmap","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":29,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"And I click the vote button on a roadmap item","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"Then the vote count should increase by 1","stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"And the vote button should appear highlighted","stepMatchArguments":[]}]},
  {"pwTestLine":34,"pickleLine":30,"tags":[],"steps":[{"pwStepLine":35,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"When I navigate to \"/roadmap\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/roadmap\"","children":[{"start":15,"value":"/roadmap","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":36,"gherkinStepLine":32,"keywordType":"Action","textWithKeyword":"And I click the vote button on the same roadmap item twice","stepMatchArguments":[]},{"pwStepLine":37,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"Then the vote count should only increase by 1","stepMatchArguments":[]}]},
  {"pwTestLine":40,"pickleLine":35,"tags":[],"steps":[{"pwStepLine":41,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"When I navigate to \"/guides\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/guides\"","children":[{"start":15,"value":"/guides","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":42,"gherkinStepLine":37,"keywordType":"Outcome","textWithKeyword":"Then I should see the heading containing \"Guides\"","stepMatchArguments":[{"group":{"start":36,"value":"\"Guides\"","children":[{"start":37,"value":"Guides","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":43,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"And I should see category filter options","stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"And each guide card should display a title and excerpt","stepMatchArguments":[]}]},
  {"pwTestLine":47,"pickleLine":41,"tags":[],"steps":[{"pwStepLine":48,"gherkinStepLine":42,"keywordType":"Action","textWithKeyword":"When I navigate to \"/guides\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/guides\"","children":[{"start":15,"value":"/guides","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":49,"gherkinStepLine":43,"keywordType":"Action","textWithKeyword":"And I click the \"Buyer Tips\" category filter","stepMatchArguments":[{"group":{"start":12,"value":"\"Buyer Tips\"","children":[{"start":13,"value":"Buyer Tips","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":50,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"Then only buyer tips guides should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":53,"pickleLine":46,"tags":[],"steps":[{"pwStepLine":54,"gherkinStepLine":47,"keywordType":"Context","textWithKeyword":"Given there is a published guide with slug \"how-to-buy-crm\"","stepMatchArguments":[{"group":{"start":37,"value":"\"how-to-buy-crm\"","children":[{"start":38,"value":"how-to-buy-crm","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":55,"gherkinStepLine":48,"keywordType":"Action","textWithKeyword":"When I navigate to \"/guides/how-to-buy-crm\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/guides/how-to-buy-crm\"","children":[{"start":15,"value":"/guides/how-to-buy-crm","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":56,"gherkinStepLine":49,"keywordType":"Outcome","textWithKeyword":"Then I should see the guide title","stepMatchArguments":[]},{"pwStepLine":57,"gherkinStepLine":50,"keywordType":"Outcome","textWithKeyword":"And I should see a \"Back to all guides\" link","stepMatchArguments":[{"group":{"start":15,"value":"\"Back to all guides\"","children":[{"start":16,"value":"Back to all guides","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":60,"pickleLine":52,"tags":[],"steps":[{"pwStepLine":61,"gherkinStepLine":53,"keywordType":"Action","textWithKeyword":"When I navigate to \"/careers\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/careers\"","children":[{"start":15,"value":"/careers","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":62,"gherkinStepLine":54,"keywordType":"Outcome","textWithKeyword":"Then I should see the heading \"Join Our Team\"","stepMatchArguments":[{"group":{"start":25,"value":"\"Join Our Team\"","children":[{"start":26,"value":"Join Our Team","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":63,"gherkinStepLine":55,"keywordType":"Outcome","textWithKeyword":"And I should see job listing cards with department badges","stepMatchArguments":[]}]},
  {"pwTestLine":66,"pickleLine":57,"tags":[],"steps":[{"pwStepLine":67,"gherkinStepLine":58,"keywordType":"Action","textWithKeyword":"When I navigate to \"/careers\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/careers\"","children":[{"start":15,"value":"/careers","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":68,"gherkinStepLine":59,"keywordType":"Action","textWithKeyword":"And I click the \"Engineering\" department filter","stepMatchArguments":[{"group":{"start":12,"value":"\"Engineering\"","children":[{"start":13,"value":"Engineering","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":69,"gherkinStepLine":60,"keywordType":"Outcome","textWithKeyword":"Then only engineering jobs should be visible","stepMatchArguments":[]}]},
  {"pwTestLine":72,"pickleLine":62,"tags":[],"steps":[{"pwStepLine":73,"gherkinStepLine":63,"keywordType":"Action","textWithKeyword":"When I navigate to \"/careers\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/careers\"","children":[{"start":15,"value":"/careers","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":74,"gherkinStepLine":64,"keywordType":"Outcome","textWithKeyword":"Then job cards with an apply URL should show an \"Apply Now\" button","stepMatchArguments":[{"group":{"start":43,"value":"\"Apply Now\"","children":[{"start":44,"value":"Apply Now","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":77,"pickleLine":66,"tags":[],"steps":[{"pwStepLine":78,"gherkinStepLine":67,"keywordType":"Action","textWithKeyword":"When I navigate to \"/guides/this-slug-does-not-exist\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/guides/this-slug-does-not-exist\"","children":[{"start":15,"value":"/guides/this-slug-does-not-exist","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":79,"gherkinStepLine":68,"keywordType":"Outcome","textWithKeyword":"Then I should see an error state or 404 message","stepMatchArguments":[]}]},
]; // bdd-data-end