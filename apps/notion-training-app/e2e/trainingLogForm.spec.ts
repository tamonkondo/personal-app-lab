/**
 * トレーニング記録フォーム (react-hook-form + zod) の E2E テスト。
 * API はすべて route intercept でモックし、フォーム操作から
 * 送信ペイロードの検証までをブラウザ実挙動で確認する。
 */
import { expect, test, type Page } from "@playwright/test";

/** exercise/names と training-logs をモックし、POST ペイロードを捕捉する */
async function mockApi(page: Page) {
  const captured: { createPayload: unknown } = { createPayload: null };

  await page.route("**/api/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const json = (body: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
      });

    if (url.includes("/exercise/names")) {
      return json({
        message: "getExerciseNames",
        data: [
          { id: "ex-bench", name: "ベンチプレス" },
          { id: "ex-squat", name: "スクワット" },
        ],
      });
    }
    if (url.includes("/training-logs") && method === "POST") {
      captured.createPayload = route.request().postDataJSON();
      return json(
        {
          message: "createTrainingLog",
          data: { id: "new-log-1", url: "", exerciseLogIds: [] },
        },
        201,
      );
    }
    if (url.includes("/training-logs")) {
      return json({
        message: "getTrainingLogs",
        data: [],
        meta: { has_more: false },
      });
    }
    return json({ message: "mock", data: null });
  });

  return captured;
}

test.describe("トレーニング記録の作成フォーム", () => {
  test("種目0件では登録できず、ダイアログの検証が効く", async ({ page }) => {
    await mockApi(page);
    await page.goto("training-logs/new");

    // 初期状態: 登録ボタンは無効
    const submitButton = page.getByRole("button", { name: "登録する" }).first();
    await expect(submitButton).toBeDisabled();

    // ダイアログを開く。種目未選択では保存できない
    await page.getByRole("button", { name: "種目を追加" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const saveButton = dialog.getByRole("button", { name: "保存" });
    await expect(saveButton).toBeDisabled();

    // 種目を選択し、セット未入力で保存 → zod エラー
    await dialog.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "ベンチプレス" }).click();
    await saveButton.click();
    await expect(
      page.getByText("セットを1つ以上入力してください"),
    ).toBeVisible();

    // 不正な kg (負数) はフィールドエラー
    await page.getByPlaceholder("kg").fill("-10");
    await page.getByPlaceholder("rep").fill("5");
    await saveButton.click();
    await expect(page.getByText("0以上の数値で入力してください")).toBeVisible();
  });

  test("種目とセットを入力して登録すると期待どおりのペイロードを送信する", async ({
    page,
  }) => {
    const captured = await mockApi(page);
    await page.goto("training-logs/new");

    // 種目を追加 (100kg x 5)
    await page.getByRole("button", { name: "種目を追加" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "ベンチプレス" }).click();
    await page.getByPlaceholder("kg").fill("100");
    await page.getByPlaceholder("rep").fill("5");
    await dialog.getByRole("button", { name: "保存" }).click();
    await expect(dialog).toBeHidden();

    // カード表示と登録ボタンの有効化
    await expect(
      page.getByRole("heading", { name: "ベンチプレス" }),
    ).toBeVisible();
    const submitButton = page.getByRole("button", { name: "登録する" }).first();
    await expect(submitButton).toBeEnabled();

    // 編集ダイアログで2セット目を追加 (90kg x 8)
    await page.getByRole("button", { name: "編集", exact: true }).click();
    await expect(dialog).toBeVisible();
    await page.getByRole("button", { name: "セット追加" }).click();
    await dialog.getByPlaceholder("kg").nth(1).fill("90");
    await dialog.getByPlaceholder("rep").nth(1).fill("8");
    await dialog.getByRole("button", { name: "保存" }).click();
    await expect(dialog).toBeHidden();

    // 基本情報を入力して送信
    await page.getByPlaceholder("72.4").fill("72.5");
    await page
      .getByPlaceholder("今日のコンディション、フォームの気づきなど")
      .fill("E2Eテスト");
    await submitButton.click();

    // 作成 API のペイロードと遷移を検証 (date はフォーム初期値の当日)
    await page.waitForURL("**/training-logs/new-log-1");
    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    expect(captured.createPayload).toEqual({
      date: today,
      bodyWeight: 72.5,
      memo: "E2Eテスト",
      exercises: [
        {
          exerciseId: "ex-bench",
          rest: 90,
          memo: "",
          sets: [
            { kg: 100, rep: 5, memo: "" },
            { kg: 90, rep: 8, memo: "" },
          ],
        },
      ],
    });
  });
});
