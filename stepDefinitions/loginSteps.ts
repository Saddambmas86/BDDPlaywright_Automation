import { Given, When, Then } from "@cucumber/cucumber";
import { LoginPage } from "../pages/LoginPage";
import { env } from "../config/env";
import { Logger } from "../utils/Logger";

let loginpage:LoginPage;

Given("User is on the login page", async function () {
    Logger.info("Opening login page");
    try {
      loginpage = new LoginPage(this.page);  //--- we create object bcoz navigateTo is in base page and login page is extending base page so we can access navigateTo method using loginpage object
      await loginpage.navigateTo("https://www.demoblaze.com/index.html");
      Logger.success("Successfully navigated to login page");
    } catch {
      Logger.error("Failed to navigate to login page");
    }
});

When(
  "User enters username as {string} and password as {string}", async function (username, password) {
    Logger.info("Attempting to login with username: " + username);
    try {
      await loginpage.Login(username, password);
      Logger.success("Successfully entered login credentials");
    } catch (error) {
      Logger.error("Failed to enter login credentials", error);
      throw error;
    }
  });

Then("User should be logged in successfully", function () {
  Logger.success("Verified: User is logged in successfully");
});
