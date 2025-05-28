import test, { expect } from "@playwright/test";
import path from "path";

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

test("should allow user to add a hotel", async ({ page }) => {
  await page.goto(`${UI_URL}/add-hotel`);

  await page.locator("[name=name]").fill("test_name");
  await page.locator("[name=city]").fill("test_city");
  await page.locator("[name=country]").fill("test_country");
  await page.locator("[name=description]").fill("test_description");
  await page.locator("[name=pricePerNight]").fill("100");

  await page.selectOption('select[name="starRating"]', "3");

  await page.getByText("Budget").click();

  await page.getByLabel("Parking").check();
  await page.getByLabel("Bar").check();

  await page.locator("[name=adultCount]").fill("3");
  await page.locator("[name=childCount]").fill("1");

  await page.setInputFiles('[name="imageFiles"]', [
    path.join(__dirname, "files", "test1.jpg"),
    path.join(__dirname, "files", "test2.jpg"),
  ]);

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Hotel added!")).toBeVisible();
});

test("should display hotels", async ({ page }) => {
  await page.goto(`${UI_URL}/my-hotels`);

  await expect(page.getByText(/^test_name.*/).first()).toBeVisible();
  await expect(page.getByText("test_description").first()).toBeVisible();
  await expect(page.getByText("test_city, test_country").first()).toBeVisible();
  await expect(page.getByText("Budget").first()).toBeVisible();
  await expect(page.getByText("$100 per night").first()).toBeVisible();
  await expect(page.getByText("3 adults, 1 children").first()).toBeVisible();
  await expect(page.getByText("3 Stars").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Hotel" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "View Details" }).first()).toBeVisible();
});

test("should edit hotel", async ({ page }) => {
  await page.goto(`${UI_URL}/my-hotels`);

  await page.getByRole("link", { name: "View Details" }).first().click();

  await page.waitForSelector('[name="name"]', { state: "attached" });

  await expect(page.locator('[name="name"]')).toHaveValue(/^test_name.*/);
  await page.locator('[name="name"]').fill("test_name UPDATED");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Hotel saved!")).toBeVisible();
});
