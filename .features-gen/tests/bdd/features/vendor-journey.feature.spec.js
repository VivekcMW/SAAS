// Generated from: tests/bdd/features/vendor-journey.feature
import { test } from "playwright-bdd";

test.describe('Vendor Onboarding and Management Journey', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('the Moonmart application is running', null, { page }); 
  });
  
  test('Vendor registers an account', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/register"', null, { page }); 
    await And('I fill in a valid email and password', null, { page }); 
    await And('I select "Vendor" as my account type', null, { page }); 
    await And('I submit the registration form', null, { page }); 
    await Then('I should be redirected to the onboarding flow', null, { page }); 
    await And('I should see a confirmation message', null, { page }); 
  });

  test('Vendor logs in and sees their dashboard', async ({ Given, When, Then, page }) => { 
    await Given('I am logged in as a vendor', null, { page }); 
    await When('I navigate to "/dashboard"', null, { page }); 
    await Then('I should see dashboard analytics or a setup prompt', null, { page }); 
  });

  test('Vendor cannot access admin panel', async ({ Given, When, Then, And, page }) => { 
    await Given('I am logged in as a vendor', null, { page }); 
    await When('I navigate to "/admin"', null, { page }); 
    await Then('I should be redirected away from the admin page', null, { page }); 
    await And('I should see an access denied message', null, { page }); 
  });

  test('Vendor sees their product in the marketplace', async ({ Given, When, Then, And, page }) => { 
    await Given('I am logged in as a vendor', null, { page }); 
    await And('my product is listed and published'); 
    await When('I navigate to the marketplace and search for my product name', null, { page }); 
    await Then('my product should appear in the results', null, { page }); 
  });

  test('Vendor views pricing comparison page', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/pricing"', null, { page }); 
    await Then('the pricing page should load', null, { page }); 
    await And('I should see at least one pricing tier', null, { page }); 
  });

  test('Vendor checks the roadmap for upcoming features', async ({ When, Then, And, page }) => { 
    await When('I navigate to "/roadmap"', null, { page }); 
    await Then('I should see roadmap items grouped by quarter', null, { page }); 
    await And('each item should display a status badge', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/bdd/features/vendor-journey.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the Moonmart application is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"When I navigate to \"/register\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/register\"","children":[{"start":15,"value":"/register","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"And I fill in a valid email and password","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"And I select \"Vendor\" as my account type","stepMatchArguments":[{"group":{"start":9,"value":"\"Vendor\"","children":[{"start":10,"value":"Vendor","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"And I submit the registration form","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then I should be redirected to the onboarding flow","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And I should see a confirmation message","stepMatchArguments":[]}]},
  {"pwTestLine":19,"pickleLine":17,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the Moonmart application is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":18,"keywordType":"Context","textWithKeyword":"Given I am logged in as a vendor","stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I navigate to \"/dashboard\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/dashboard\"","children":[{"start":15,"value":"/dashboard","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":22,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Then I should see dashboard analytics or a setup prompt","stepMatchArguments":[]}]},
  {"pwTestLine":25,"pickleLine":22,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the Moonmart application is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":23,"keywordType":"Context","textWithKeyword":"Given I am logged in as a vendor","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"When I navigate to \"/admin\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/admin\"","children":[{"start":15,"value":"/admin","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":28,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then I should be redirected away from the admin page","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"And I should see an access denied message","stepMatchArguments":[]}]},
  {"pwTestLine":32,"pickleLine":28,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the Moonmart application is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":29,"keywordType":"Context","textWithKeyword":"Given I am logged in as a vendor","stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":30,"keywordType":"Context","textWithKeyword":"And my product is listed and published","stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"When I navigate to the marketplace and search for my product name","stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"Then my product should appear in the results","stepMatchArguments":[]}]},
  {"pwTestLine":39,"pickleLine":34,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the Moonmart application is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":40,"gherkinStepLine":35,"keywordType":"Action","textWithKeyword":"When I navigate to \"/pricing\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/pricing\"","children":[{"start":15,"value":"/pricing","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":41,"gherkinStepLine":36,"keywordType":"Outcome","textWithKeyword":"Then the pricing page should load","stepMatchArguments":[]},{"pwStepLine":42,"gherkinStepLine":37,"keywordType":"Outcome","textWithKeyword":"And I should see at least one pricing tier","stepMatchArguments":[]}]},
  {"pwTestLine":45,"pickleLine":39,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the Moonmart application is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When I navigate to \"/roadmap\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/roadmap\"","children":[{"start":15,"value":"/roadmap","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":47,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then I should see roadmap items grouped by quarter","stepMatchArguments":[]},{"pwStepLine":48,"gherkinStepLine":42,"keywordType":"Outcome","textWithKeyword":"And each item should display a status badge","stepMatchArguments":[]}]},
]; // bdd-data-end