// Generated from: tests/bdd/features/auth-journey.feature
import { test } from "playwright-bdd";

test.describe('Authentication Flows', () => {

  test('Successful registration with valid details', async ({ Given, When, Then, And, page }) => { 
    await Given('I am on the registration page', null, { page }); 
    await When('I enter a unique email address', null, { page }); 
    await And('I enter a strong password', null, { page }); 
    await And('I submit the form', null, { page }); 
    await Then('I should be redirected or shown a success state', null, { page }); 
    await And('I should not see a raw server error', null, { page }); 
  });

  test('Registration fails with duplicate email', async ({ Given, When, Then, And, page }) => { 
    await Given('I am on the registration page', null, { page }); 
    await When('I enter an email that is already registered', null, { page }); 
    await And('I enter any password', null, { page }); 
    await And('I submit the form', null, { page }); 
    await Then('I should see an error message about the email being taken', null, { page }); 
  });

  test('Registration fails with weak password', async ({ Given, When, Then, And, page }) => { 
    await Given('I am on the registration page', null, { page }); 
    await When('I enter a valid email address', null, { page }); 
    await And('I enter the password "123"', null, { page }); 
    await And('I submit the form', null, { page }); 
    await Then('I should see a validation error', null, { page }); 
  });

  test('Login with correct credentials succeeds', async ({ Given, When, Then, And, page }) => { 
    await Given('a user account exists with known credentials'); 
    await When('I navigate to the login page', null, { page }); 
    await And('I enter the correct email and password', null, { page }); 
    await And('I submit the login form', null, { page }); 
    await Then('I should be redirected to the dashboard', null, { page }); 
  });

  test('Login with wrong password is rejected', async ({ When, Then, And, page }) => { 
    await When('I navigate to the login page', null, { page }); 
    await And('I enter "test@example.com" as the email', null, { page }); 
    await And('I enter "wrongpassword" as the password', null, { page }); 
    await And('I submit the login form', null, { page }); 
    await Then('I should remain on the login page', null, { page }); 
    await And('I should see an authentication error message', null, { page }); 
  });

  test('Login page has no XSS vulnerability', async ({ When, Then, And, page }) => { 
    await When('I navigate to the login page', null, { page }); 
    await And('I enter "<script>alert(1)</script>" in the email field', null, { page }); 
    await And('I submit the form', null, { page }); 
    await Then('no alert dialog should appear', null, { page }); 
    await And('the page should remain functional', null, { page }); 
  });

  test('Password field is masked', async ({ When, Then, page }) => { 
    await When('I navigate to the login page', null, { page }); 
    await Then('the password input type should be "password"', null, { page }); 
  });

  test('Logged-in user cannot see login page again', async ({ Given, When, Then, page }) => { 
    await Given('I am logged in as a buyer', null, { page }); 
    await When('I navigate to "/login"', null, { page }); 
    await Then('I should be redirected away from the login page', null, { page }); 
  });

  test('User can log out', async ({ Given, When, Then, And, page }) => { 
    await Given('I am logged in as a buyer', null, { page }); 
    await When('I click the logout button', null, { page }); 
    await Then('I should be redirected to the homepage or login page', null, { page }); 
    await And('I should no longer see authenticated navigation items', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/bdd/features/auth-journey.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I am on the registration page","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When I enter a unique email address","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"And I enter a strong password","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"And I submit the form","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then I should be redirected or shown a success state","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And I should not see a raw server error","stepMatchArguments":[]}]},
  {"pwTestLine":15,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":16,"gherkinStepLine":15,"keywordType":"Context","textWithKeyword":"Given I am on the registration page","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"When I enter an email that is already registered","stepMatchArguments":[]},{"pwStepLine":18,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"And I enter any password","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"And I submit the form","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then I should see an error message about the email being taken","stepMatchArguments":[]}]},
  {"pwTestLine":23,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":24,"gherkinStepLine":22,"keywordType":"Context","textWithKeyword":"Given I am on the registration page","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"When I enter a valid email address","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"And I enter the password \"123\"","stepMatchArguments":[{"group":{"start":21,"value":"\"123\"","children":[{"start":22,"value":"123","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":27,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"And I submit the form","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"Then I should see a validation error","stepMatchArguments":[]}]},
  {"pwTestLine":31,"pickleLine":28,"tags":[],"steps":[{"pwStepLine":32,"gherkinStepLine":29,"keywordType":"Context","textWithKeyword":"Given a user account exists with known credentials","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"When I navigate to the login page","stepMatchArguments":[]},{"pwStepLine":34,"gherkinStepLine":31,"keywordType":"Action","textWithKeyword":"And I enter the correct email and password","stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":32,"keywordType":"Action","textWithKeyword":"And I submit the login form","stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"Then I should be redirected to the dashboard","stepMatchArguments":[]}]},
  {"pwTestLine":39,"pickleLine":35,"tags":[],"steps":[{"pwStepLine":40,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"When I navigate to the login page","stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"And I enter \"test@example.com\" as the email","stepMatchArguments":[{"group":{"start":8,"value":"\"test@example.com\"","children":[{"start":9,"value":"test@example.com","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":42,"gherkinStepLine":38,"keywordType":"Action","textWithKeyword":"And I enter \"wrongpassword\" as the password","stepMatchArguments":[{"group":{"start":8,"value":"\"wrongpassword\"","children":[{"start":9,"value":"wrongpassword","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":43,"gherkinStepLine":39,"keywordType":"Action","textWithKeyword":"And I submit the login form","stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":40,"keywordType":"Outcome","textWithKeyword":"Then I should remain on the login page","stepMatchArguments":[]},{"pwStepLine":45,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"And I should see an authentication error message","stepMatchArguments":[]}]},
  {"pwTestLine":48,"pickleLine":43,"tags":[],"steps":[{"pwStepLine":49,"gherkinStepLine":44,"keywordType":"Action","textWithKeyword":"When I navigate to the login page","stepMatchArguments":[]},{"pwStepLine":50,"gherkinStepLine":45,"keywordType":"Action","textWithKeyword":"And I enter \"<script>alert(1)</script>\" in the email field","stepMatchArguments":[{"group":{"start":8,"value":"\"<script>alert(1)</script>\"","children":[{"start":9,"value":"<script>alert(1)</script>","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":51,"gherkinStepLine":46,"keywordType":"Action","textWithKeyword":"And I submit the form","stepMatchArguments":[]},{"pwStepLine":52,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"Then no alert dialog should appear","stepMatchArguments":[]},{"pwStepLine":53,"gherkinStepLine":48,"keywordType":"Outcome","textWithKeyword":"And the page should remain functional","stepMatchArguments":[]}]},
  {"pwTestLine":56,"pickleLine":50,"tags":[],"steps":[{"pwStepLine":57,"gherkinStepLine":51,"keywordType":"Action","textWithKeyword":"When I navigate to the login page","stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":52,"keywordType":"Outcome","textWithKeyword":"Then the password input type should be \"password\"","stepMatchArguments":[{"group":{"start":34,"value":"\"password\"","children":[{"start":35,"value":"password","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":61,"pickleLine":54,"tags":[],"steps":[{"pwStepLine":62,"gherkinStepLine":55,"keywordType":"Context","textWithKeyword":"Given I am logged in as a buyer","stepMatchArguments":[]},{"pwStepLine":63,"gherkinStepLine":56,"keywordType":"Action","textWithKeyword":"When I navigate to \"/login\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/login\"","children":[{"start":15,"value":"/login","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":64,"gherkinStepLine":57,"keywordType":"Outcome","textWithKeyword":"Then I should be redirected away from the login page","stepMatchArguments":[]}]},
  {"pwTestLine":67,"pickleLine":59,"tags":[],"steps":[{"pwStepLine":68,"gherkinStepLine":60,"keywordType":"Context","textWithKeyword":"Given I am logged in as a buyer","stepMatchArguments":[]},{"pwStepLine":69,"gherkinStepLine":61,"keywordType":"Action","textWithKeyword":"When I click the logout button","stepMatchArguments":[]},{"pwStepLine":70,"gherkinStepLine":62,"keywordType":"Outcome","textWithKeyword":"Then I should be redirected to the homepage or login page","stepMatchArguments":[]},{"pwStepLine":71,"gherkinStepLine":63,"keywordType":"Outcome","textWithKeyword":"And I should no longer see authenticated navigation items","stepMatchArguments":[]}]},
]; // bdd-data-end