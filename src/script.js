document.addEventListener('click', (e) => {
    if (e.target.id === 'show-instructions') {
        document.getElementById('instruction-popup').style.display = 'flex';
    } else if (e.target.id === 'close-popup') {
        document.getElementById('instruction-popup').style.display = 'none';
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const accountsGrid = document.getElementById('accounts-grid');
    const selectAllCheckbox = document.getElementById("select-all");
    const submitCodeBtn = document.getElementById("submit-code-btn");
    const codeInput = document.getElementById("code-input");
    const responseOutput = document.getElementById("response-output");
    const mainAccRadio = document.getElementById("main-acc");
    const cloneAccRadio = document.getElementById("clone-acc");

    let currentFilePath = "./src/acc_main.json";

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function updateSelectAllState() {
        const checkboxes = document.querySelectorAll(".account-checkbox");
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        selectAllCheckbox.checked = allChecked;
    }

    function populateAccountGrid(accounts) {
        accountsGrid.innerHTML = "";
        const columnsNeeded = Math.ceil(accounts.length / 3);
        
        for (let i = 0; i < columnsNeeded; i++) {
            const column = document.createElement('div');
            column.className = 'account-column';
            
            accounts.slice(i * 3, (i + 1) * 3).forEach(account => {
                const accountItem = document.createElement('div');
                accountItem.className = 'account-item';
                
                accountItem.innerHTML = `
                    <div class="account-info">
                        <div class="account-name">${account.roleName}</div>
                        <div class="account-id">${account.roleId}</div>
                    </div>
                    <input type="checkbox" class="account-checkbox" value="${account.roleId}" checked>
                `;
                
                const checkbox = accountItem.querySelector('.account-checkbox');
                checkbox.addEventListener('change', updateSelectAllState);
                
                column.appendChild(accountItem);
            });
            
            accountsGrid.appendChild(column);
        }
        
        // Cập nhật trạng thái ban đầu của Select All
        updateSelectAllState();
    }

    async function fetchAccounts() {
        try {
            const response = await fetch(currentFilePath);
            const accounts = await response.json();
            populateAccountGrid(accounts);
        } catch (error) {
            console.error("Failed to load accounts:", error);
            responseOutput.value += `[*] Error: Failed to load accounts from ${currentFilePath}\n`;
        }
    }

    mainAccRadio.addEventListener("change", () => {
        if (mainAccRadio.checked) {
            currentFilePath = "./src/acc_main.json";
            fetchAccounts();
        }
    });

    cloneAccRadio.addEventListener("change", () => {
        if (cloneAccRadio.checked) {
            currentFilePath = "./src/acc_clone.json";
            fetchAccounts();
        }
    });

    selectAllCheckbox.addEventListener("change", () => {
        document.querySelectorAll(".account-checkbox").forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });

    submitCodeBtn.addEventListener("click", async () => {
        const codes = codeInput.value.split(/[\s,]+/).map(code => code.trim()).filter(Boolean);
        const selectedCheckboxes = Array.from(document.querySelectorAll(".account-checkbox:checked"));

        if (!codes.length || !selectedCheckboxes.length) {
            alert("Vui lòng nhập code và chọn ít nhất một acc để nhập code.");
            return;
        }

        try {
            const response = await fetch(currentFilePath);
            const accounts = await response.json();

            for (const checkbox of selectedCheckboxes) {
                const account = accounts.find(acc => acc.roleId === checkbox.value);
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
                                    authorization: "bG1aMmp2dU9pMW1ndGdrcktRQ29QbVVwVDBnUmNQdFI4THJkbE84U0tkMD1uTk5Ycm81eENxWk44aHc2ZkxYLTRqUDFIKVptVGlNOWtwWU1wVmpZSGpjemRWZ0wzUFhsJHlFQUp4KkJyI0lPOHBrYU9HJEZSQWNhKXZlaTFoeXcrMTI3NzU5NDk4ODAyMjY4MTYwMA==",
                                    "content-type": "application/json",
                                    priority: "u=1, i",
                                    "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
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
                        responseOutput.value += `[*] Success: ${account.roleName} \t-\t Status: ${result?.status}\n`;
                    } catch (error) {
                        responseOutput.value += `[*] Error: ${account.roleName} \t-\t Status: ${error.response?.data?.message}\n`;
                    }
                }
                await delay(1000);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
    
    fetchAccounts();
});
