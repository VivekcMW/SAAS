// Generated from: tests/bdd/features/marketplace-search.feature
import { test } from "playwright-bdd";

test.describe('Marketplace Search and Filter', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the marketplace page', null, { page }); 
  });
  
  test('Empty search returns results', async ({ When, Then, And, page }) => { 
    await When('I load the marketplace without any filters', null, { page }); 
    await Then('the page should display product cards', null, { page }); 
    await And('the URL should not show an error', null, { page }); 
  });

  test.describe('Searching by keyword', () => {

    test('Example #1', async ({ When, Then, And, page }) => { 
      await When('I search for "crm"', null, { page }); 
      await Then('I should see results or a no-results message', null, { page }); 
      await And('the page should not crash', null, { page }); 
    });

    test('Example #2', async ({ When, Then, And, page }) => { 
      await When('I search for "project"', null, { page }); 
      await Then('I should see results or a no-results message', null, { page }); 
      await And('the page should not crash', null, { page }); 
    });

    test('Example #3', async ({ When, Then, And, page }) => { 
      await When('I search for "nonexistent999xyz"', null, { page }); 
      await Then('I should see results or a no-results message', null, { page }); 
      await And('the page should not crash', null, { page }); 
    });

  });

  test('Filtering by price type', async ({ When, Then, page }) => { 
    await When('I select the "Free" price filter', null, { page }); 
    await Then('all visible products should indicate free pricing', null, { page }); 
  });

  test('Sorting by rating', async ({ When, Then, page }) => { 
    await When('I select "Top Rated" sort option', null, { page }); 
    await Then('products should appear in descending rating order', null, { page }); 
  });

  test('Clicking a product card navigates to its detail page', async ({ When, Then, And, page }) => { 
    await When('I click on the first product card', null, { page }); 
    await Then('I should be redirected to a URL matching "/marketplace/"', null, { page }); 
    await And('the page title should contain the product name', null, { page }); 
  });

  test('Pagination works correctly', async ({ Given, When, Then, And, page }) => { 
    await Given('there are more products than fit on one page', null, { page }); 
    await When('I click the "Next" pagination button', null, { page }); 
    await Then('the page number should increment', null, { page }); 
    await And('new products should appear', null, { page }); 
  });

  test('Mobile viewport shows adapted layout', async ({ Given, Then, And, page }) => { 
    await Given('I am viewing the marketplace on a mobile viewport', null, { page }); 
    await Then('the filter sidebar should be collapsed or hidden by default', null, { page }); 
    await And('the product grid should be single-column or two-column', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/bdd/features/marketplace-search.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the marketplace page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"When I load the marketplace without any filters","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then the page should display product cards","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And the URL should not show an error","stepMatchArguments":[]}]},
  {"pwTestLine":18,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the marketplace page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I search for \"crm\"","stepMatchArguments":[{"group":{"start":13,"value":"\"crm\"","children":[{"start":14,"value":"crm","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I should see results or a no-results message","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And the page should not crash","stepMatchArguments":[]}]},
  {"pwTestLine":24,"pickleLine":22,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the marketplace page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I search for \"project\"","stepMatchArguments":[{"group":{"start":13,"value":"\"project\"","children":[{"start":14,"value":"project","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I should see results or a no-results message","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And the page should not crash","stepMatchArguments":[]}]},
  {"pwTestLine":30,"pickleLine":23,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the marketplace page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I search for \"nonexistent999xyz\"","stepMatchArguments":[{"group":{"start":13,"value":"\"nonexistent999xyz\"","children":[{"start":14,"value":"nonexistent999xyz","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":32,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I should see results or a no-results message","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And the page should not crash","stepMatchArguments":[]}]},
  {"pwTestLine":38,"pickleLine":25,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the marketplace page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":39,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"When I select the \"Free\" price filter","stepMatchArguments":[{"group":{"start":13,"value":"\"Free\"","children":[{"start":14,"value":"Free","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":40,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"Then all visible products should indicate free pricing","stepMatchArguments":[]}]},
  {"pwTestLine":43,"pickleLine":29,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the marketplace page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"When I select \"Top Rated\" sort option","stepMatchArguments":[{"group":{"start":9,"value":"\"Top Rated\"","children":[{"start":10,"value":"Top Rated","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":45,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"Then products should appear in descending rating order","stepMatchArguments":[]}]},
  {"pwTestLine":48,"pickleLine":33,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the marketplace page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":49,"gherkinStepLine":34,"keywordType":"Action","textWithKeyword":"When I click on the first product card","stepMatchArguments":[]},{"pwStepLine":50,"gherkinStepLine":35,"keywordType":"Outcome","textWithKeyword":"Then I should be redirected to a URL matching \"/marketplace/\"","stepMatchArguments":[{"group":{"start":41,"value":"\"/marketplace/\"","children":[{"start":42,"value":"/marketplace/","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":51,"gherkinStepLine":36,"keywordType":"Outcome","textWithKeyword":"And the page title should contain the product name","stepMatchArguments":[]}]},
  {"pwTestLine":54,"pickleLine":38,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the marketplace page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":55,"gherkinStepLine":39,"keywordType":"Context","textWithKeyword":"Given there are more products than fit on one page","stepMatchArguments":[]},{"pwStepLine":56,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When I click the \"Next\" pagination button","stepMatchArguments":[{"group":{"start":12,"value":"\"Next\"","children":[{"start":13,"value":"Next","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":57,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then the page number should increment","stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":42,"keywordType":"Outcome","textWithKeyword":"And new products should appear","stepMatchArguments":[]}]},
  {"pwTestLine":61,"pickleLine":44,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the marketplace page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":62,"gherkinStepLine":45,"keywordType":"Context","textWithKeyword":"Given I am viewing the marketplace on a mobile viewport","stepMatchArguments":[]},{"pwStepLine":63,"gherkinStepLine":46,"keywordType":"Outcome","textWithKeyword":"Then the filter sidebar should be collapsed or hidden by default","stepMatchArguments":[]},{"pwStepLine":64,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"And the product grid should be single-column or two-column","stepMatchArguments":[]}]},
]; // bdd-data-end