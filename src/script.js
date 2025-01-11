// Mở popup khi nhấn nút Show
document
  .getElementById("show-instructions")
  .addEventListener("click", function () {
    document.getElementById("instruction-popup").style.display = "flex";
  });

// Đóng popup khi nhấn nút X
document.getElementById("close-popup").addEventListener("click", function () {
  document.getElementById("instruction-popup").style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => {
  const accountTableBody = document.querySelector("#account-table tbody");
  const selectAllCheckbox = document.getElementById("select-all");
  const submitCodeBtn = document.getElementById("submit-code-btn");
  const dailyClubBtn = document.getElementById("daily-club-btn");
  const codeInput = document.getElementById("code-input");
  const responseOutput = document.getElementById("response-output");

  const accountsFilePath = "./src/account.json";

  async function fetchAccounts() {
    try {
      const response = await fetch(accountsFilePath);
      const accounts = await response.json();
      populateAccountTable(accounts);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  }
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function populateAccountTable(accounts) {
    accountTableBody.innerHTML = "";
    accounts.forEach((account) => {
      const row = document.createElement("tr");

      const checkboxCell = document.createElement("td");
      checkboxCell.classList.add("checkbox-cell");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = account.roleId;
      checkbox.checked = true;
      checkboxCell.appendChild(checkbox);
      row.appendChild(checkboxCell);

      const nameCell = document.createElement("td");
      nameCell.classList.add("fit-content");
      nameCell.textContent = account.roleName;
      row.appendChild(nameCell);

      const idCell = document.createElement("td");
      idCell.classList.add("w-200px");
      idCell.textContent = account.roleId;
      row.appendChild(idCell);

      accountTableBody.appendChild(row);
    });
  }

  selectAllCheckbox.addEventListener("change", () => {
    const checkboxes = accountTableBody.querySelectorAll(
      "input[type=checkbox]"
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
    });
  });

  submitCodeBtn.addEventListener("click", async () => {
    const codes = codeInput.value
      .split(/[\s,]+/)
      .map((code) => code.trim())
      .filter(Boolean);
    const selectedCheckboxes = Array.from(
      accountTableBody.querySelectorAll("input[type=checkbox]:checked")
    );

    if (!codes.length || !selectedCheckboxes.length) {
      alert("Vui lòng nhập code và chọn ít nhất một acc để nhập code.");
      return;
    }

    try {
      const response = await fetch(accountsFilePath);
      const accounts = await response.json();

      for (const checkbox of selectedCheckboxes) {
        const account = accounts.find((acc) => acc.roleId === checkbox.value);

        if (!account) {
          responseOutput.value += `Error: Account with ID ${checkbox.value} not found.\n`;
          continue;
        }

        for (const code of codes) {
          try {
            account.code = code.toUpperCase();
            const result = await axios.post(
              "https://vgrapi-sea.vnggames.com/coordinator/api/v1/code/redeem",
              account,
              {
                headers: {
                  accept: "application/json, text/plain, */*",
                  "accept-language": "vi,en-US;q=0.9,en;q=0.8",
                  authorization:
                    "bG1aMmp2dU9pMW1ndGdrcktRQ29QbVVwVDBnUmNQdFI4THJkbE84U0tkMD1uTk5Ycm81eENxWk44aHc2ZkxYLTRqUDFIKVptVGlNOWtwWU1wVmpZSGpjemRWZ0wzUFhsJHlFQUp4KkJyI0lPOHBrYU9HJEZSQWNhKXZlaTFoeXcrMTI3NzU5NDk4ODAyMjY4MTYwMA==",
                  "content-type": "application/json",
                  priority: "u=1, i",
                  "sec-ch-ua":
                    '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-platform": '"Windows"',
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-site",
                  "x-client-region": "VN",
                  "x-request-id": "6001cf83-1d93-4d90-9be6-3d77088870d1",
                  Referer: "https://giftcode.vnggames.com/",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                },
              }
            );

            responseOutput.value += `[*] Success: Code ${code} redeemed for ${account.roleName} - Status: ${result?.status}\n`;
          } catch (error) {
            responseOutput.value += `[*] Error: Failed to redeem code ${code} for ${account.roleName} - Status: ${error.response?.data?.message}\n`;
          }
        }

        // Wait 2 seconds before continuing the loop
        await delay(1000);
      }
    } catch (error) {
      console.error("Error redeeming codes:", error);
    }
  });

  dailyClubBtn.addEventListener("click", async () => {
    const selectedCheckboxes = Array.from(
      accountTableBody.querySelectorAll("input[type=checkbox]:checked")
    );
    if (!selectedCheckboxes.length) {
      alert("Vui lòng chọn ít nhất một acc để điểm danh.");
      return;
    }
    try {
      const response = await fetch(accountsFilePath);
      const accounts = await response.json();

      for (const checkbox of selectedCheckboxes) {
        const account = accounts.find((acc) => acc.roleId === checkbox.value);

        if (!account) {
          responseOutput.value += `Error: Account with ID ${checkbox.value} not found.\n`;
          continue;
        }

        try {
            const fixRoleIds = ["2616804012", "3087504012", "3753304012"];
          const param = {
            milestoneId: fixRoleIds.includes(account.roleId) ? 2 : 1,
            promotionId: fixRoleIds.includes(account.roleId) ? "1324472005604435595" : "1324472008825699833",
            roleId: account.roleId,
            serverId: account.serverId,
          };
          const result = await axios.post(
            "https://vgrapi-sea.vnggames.com/rewards/rules-engine/v1/promotion/redeem",
            param,
            {
              headers: {
                accept: "application/json, text/plain, */*",
                "accept-language": "vi-VN",
                authorization:
                  "L3lpYjFCZE5ybElnWW4zZmRDc2Y5S21oNjM0VzdRN2xEMEQwWjQycEZMUT1HRkV4SDBUIWgyQCMpdThmMVFwVjJ4T0R0ZVlFQGdsdnptQ1R4TUd5UHhnV1VjeW1ESlJDcXlTUGRlZGNBMERGdnVpWWxWIS1CYXdVVyhobUEyQEIrMTMyNzY3OTY4MTc5NzY4MTE1Mg==",
                "content-type": "application/json",
                priority: "u=1, i",
                "sec-ch-ua":
                  '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-client-region": "VN",
                "x-request-id": "dccbac10-6012-4477-9d07-ed454187ec23",
              },
            }
          );

          responseOutput.value += `[*] Success: Daily club for ${account.roleName} - Status: ${result?.status}\n`;
        } catch (error) {
          responseOutput.value += `[*] Error: Failed to daily club for ${account.roleName} - Status: ${error.response?.data?.message}\n`;
        }

        // Wait 2 seconds before continuing the loop
        await delay(1000);
      }
    } catch (error) {
      console.error("Error daily club:", error);
    }
  });
  fetchAccounts();
});
