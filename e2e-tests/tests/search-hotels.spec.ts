import test, { expect } from "@playwright/test";

const UI_URL = "http://localhost:5173";

test.beforeEach(async ({ page }) => {
  await page.goto(UI_URL);

  await page.getByRole("link", { name: "Sign In" }).click();

  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  await page.locator("[name=email]").fill("1@1.com");

  await page.locator("[name=password]").fill("password");

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Sign in successful")).toBeVisible();
});

test("should show hotel search results", async ({ page }) => {
  await page.goto(UI_URL);

  await page.getByPlaceholder("Where are you going?").fill("test_city");

  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByText("Hotels found in test")).toBeVisible();
  await expect(page.getByText("test_name")).toBeVisible();
});

test("should show hotel details", async ({ page }) => {
  await page.goto(UI_URL);
  await page.getByPlaceholder("Where are you going?").fill("test_city");
  await page.getByRole("button", { name: "Search" }).click();
  await page
    .getByText(/^test_name.*/)
    .first()
    .click();
  await expect(page).toHaveURL(/detail/);
  await expect(page.getByRole("button", { name: "Book Now" })).toBeVisible();
});

test("should book hotel", async ({ page }) => {
  await page.goto(UI_URL);
  await page.getByPlaceholder("Where are you going?").fill("test_city");
  const date = new Date();
  date.setDate(date.getDate() + 3);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  const formattedDate = `${mm}/${dd}/${yyyy}`;

  await page.getByPlaceholder("Check-Out Date").fill(formattedDate);
  await page.getByRole("button", { name: "Search" }).click();
  await page
    .getByText(/^test_name.*/)
    .first()
    .click();
  await page.getByRole("button", { name: "Book Now" }).click();
  await expect(page.getByText("Total Cost: $300.00")).toBeVisible();

  const stripeFrame = page.frameLocator("iframe").first();
  await stripeFrame
    .locator('[placeholder="Card number"]')
    .fill("4242424242424242");
  await stripeFrame.locator('[placeholder="MM / YY"]').fill("04/30");
  await stripeFrame.locator('[placeholder="CVC"]').fill("123");
  await stripeFrame.locator('[placeholder="ZIP"]').fill("12323");

  await page.getByRole("button", { name: "Confirm Booking" }).click();
  await expect(page.getByText("Booking saved")).toBeVisible();
});
