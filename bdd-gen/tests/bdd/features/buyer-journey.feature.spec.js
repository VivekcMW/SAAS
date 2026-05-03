// Generated from: tests/bdd/features/buyer-journey.feature
import { test } from "playwright-bdd";

test.describe('Buyer Discovery Journey', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the Moonmart homepage', null, { page }); 
  });
  
  test('Buyer searches for a CRM tool', async ({ When, Then, And, page }) => { 
    await When('I navigate to the marketplace', null, { page }); 
    await And('I type "crm" into the search bar', null, { page }); 
    await Then('I should see at least one search result', null, { page }); 
    await And('each result should display a name and rating', null, { page }); 
  });

  test('Buyer filters by category', async ({ When, Then, And, page }) => { 
    await When('I navigate to the marketplace', null, { page }); 
    await And('I click on the "CRM" category', null, { page }); 
    await Then('the page URL should include a category parameter', null, { page }); 
    await And('the displayed products should be relevant to CRM', null, { page }); 
  });

  test('Buyer reads a product page', async ({ When, Then, And, page }) => { 
    await When('I navigate to the marketplace', null, { page }); 
    await And('I click on the first visible product card', null, { page }); 
    await Then('I should be on a product detail page', null, { page }); 
    await And('I should see a product description', null, { page }); 
    await And('I should see a reviews section', null, { page }); 
  });

  test('Buyer compares two products', async ({ When, Then, And, page }) => { 
    await When('I navigate to the marketplace', null, { page }); 
    await And('I select "Compare" on two products', null, { page }); 
    await Then('I should see a comparison view', null, { page }); 
    await And('the comparison should show both product names side by side', null, { page }); 
  });

  test('Buyer adds a tool to their stack', async ({ Given, When, Then, And, page }) => { 
    await Given('I am logged in as a buyer', null, { page }); 
    await When('I navigate to a product detail page', null, { page }); 
    await And('I click "Add to Stack"', null, { page }); 
    await Then('the tool should appear in my dashboard stack', null, { page }); 
  });

  test('Buyer reads a guide before buying', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/guides"', null, { page }); 
    await Then('I should see a list of guide articles', null, { page }); 
    await And('each guide should show a title, category, and read time', null, { page }); 
    await When('I click on a guide', null, { page }); 
    await Then('I should be on the guide detail page', null, { page }); 
  });

  test('Anonymous buyer sees the changelog', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/changelog"', null, { page }); 
    await Then('the page should load without errors', null, { page }); 
    await And('I should see the changelog heading', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/bdd/features/buyer-journey.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the Moonmart homepage","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"When I navigate to the marketplace","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"And I type \"crm\" into the search bar","stepMatchArguments":[{"group":{"start":7,"value":"\"crm\"","children":[{"start":8,"value":"crm","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then I should see at least one search result","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"And each result should display a name and rating","stepMatchArguments":[]}]},
  {"pwTestLine":17,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the Moonmart homepage","isBg":true,"stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"When I navigate to the marketplace","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"And I click on the \"CRM\" category","stepMatchArguments":[{"group":{"start":15,"value":"\"CRM\"","children":[{"start":16,"value":"CRM","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"Then the page URL should include a category parameter","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"And the displayed products should be relevant to CRM","stepMatchArguments":[]}]},
  {"pwTestLine":24,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the Moonmart homepage","isBg":true,"stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When I navigate to the marketplace","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"And I click on the first visible product card","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then I should be on a product detail page","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"And I should see a product description","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"And I should see a reviews section","stepMatchArguments":[]}]},
  {"pwTestLine":32,"pickleLine":28,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the Moonmart homepage","isBg":true,"stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":29,"keywordType":"Action","textWithKeyword":"When I navigate to the marketplace","stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"And I select \"Compare\" on two products","stepMatchArguments":[{"group":{"start":9,"value":"\"Compare\"","children":[{"start":10,"value":"Compare","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":35,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"Then I should see a comparison view","stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"And the comparison should show both product names side by side","stepMatchArguments":[]}]},
  {"pwTestLine":39,"pickleLine":34,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the Moonmart homepage","isBg":true,"stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":35,"keywordType":"Context","textWithKeyword":"Given I am logged in as a buyer","stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"When I navigate to a product detail page","stepMatchArguments":[]},{"pwStepLine":42,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"And I click \"Add to Stack\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Add to Stack\"","children":[{"start":9,"value":"Add to Stack","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":43,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"Then the tool should appear in my dashboard stack","stepMatchArguments":[]}]},
  {"pwTestLine":46,"pickleLine":40,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the Moonmart homepage","isBg":true,"stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":41,"keywordType":"Action","textWithKeyword":"When I navigate to \"/guides\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/guides\"","children":[{"start":15,"value":"/guides","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":48,"gherkinStepLine":42,"keywordType":"Outcome","textWithKeyword":"Then I should see a list of guide articles","stepMatchArguments":[]},{"pwStepLine":49,"gherkinStepLine":43,"keywordType":"Outcome","textWithKeyword":"And each guide should show a title, category, and read time","stepMatchArguments":[]},{"pwStepLine":50,"gherkinStepLine":44,"keywordType":"Action","textWithKeyword":"When I click on a guide","stepMatchArguments":[]},{"pwStepLine":51,"gherkinStepLine":45,"keywordType":"Outcome","textWithKeyword":"Then I should be on the guide detail page","stepMatchArguments":[]}]},
  {"pwTestLine":54,"pickleLine":47,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the Moonmart homepage","isBg":true,"stepMatchArguments":[]},{"pwStepLine":55,"gherkinStepLine":48,"keywordType":"Action","textWithKeyword":"When I navigate to \"/changelog\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/changelog\"","children":[{"start":15,"value":"/changelog","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":56,"gherkinStepLine":49,"keywordType":"Outcome","textWithKeyword":"Then the page should load without errors","stepMatchArguments":[]},{"pwStepLine":57,"gherkinStepLine":50,"keywordType":"Outcome","textWithKeyword":"And I should see the changelog heading","stepMatchArguments":[]}]},
]; // bdd-data-end