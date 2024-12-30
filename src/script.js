document.addEventListener("DOMContentLoaded", () => {
    const accountTableBody = document.querySelector("#account-table tbody");
    const selectAllCheckbox = document.getElementById("select-all");
    const submitCodeBtn = document.getElementById("submit-code-btn");
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
        accounts.forEach(account => {
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
        const checkboxes = accountTableBody.querySelectorAll("input[type=checkbox]");
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });

    submitCodeBtn.addEventListener("click", async () => {
        const codes = codeInput.value.split(/[\s,]+/).map(code => code.trim()).filter(Boolean);
        const selectedCheckboxes = Array.from(accountTableBody.querySelectorAll("input[type=checkbox]:checked"));

        if (!codes.length || !selectedCheckboxes.length) {
            alert("Please input codes and select at least one account.");
            return;
        }

        try {
            const response = await fetch(accountsFilePath);
            const accounts = await response.json();

            for (const checkbox of selectedCheckboxes) {
                const account = accounts.find(acc => acc.roleId === checkbox.value);

                if (!account) {
                    responseOutput.value += `Error: Account with ID ${checkbox.value} not found.\n`;
                    continue;
                }

                for (const code of codes) {
                    try {
                        const result = await axios.post(
                            "https://vgrapi-sea.vnggames.com/coordinator/api/v1/code/redeem",
                            { ...account, code },
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

    fetchAccounts();
});
