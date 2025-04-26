document.addEventListener("DOMContentLoaded", () => {
    const accountsGrid = document.getElementById('accounts-grid');
    const selectAllCheckbox = document.getElementById("select-all");
    const submitCodeBtn = document.getElementById("submit-code-btn");
    const codeInput = document.getElementById("code-input");
    const responseOutputs = [
        document.getElementById("response-output-1"),
        document.getElementById("response-output-2"),
        document.getElementById("response-output-3")
    ];
    const mainAccRadio = document.getElementById("main-acc");
    const cloneAccRadio = document.getElementById("clone-acc");
    const allAccRadio = document.getElementById("all-acc");

    let currentFilePath = "./src/acc_main.json";
    let currentAccounts = [];
    let currentOutputIndex = 0;

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function clearAllOutputs() {
        responseOutputs.forEach(output => output.value = '');
        currentOutputIndex = 0;
    }

    function appendToOutput(text) {
        // Chọn textarea hiện tại
        const currentOutput = responseOutputs[currentOutputIndex];
        
        // Đếm số dòng hiện tại
        const currentLines = currentOutput.value.split('\n').filter(line => line.trim()).length;
        
        // Nếu đã đạt đến 20 dòng
        if (currentLines >= 20) {
            // Chuyển sang textarea tiếp theo
            currentOutputIndex = (currentOutputIndex + 1) % 3;
            // Nếu đã quay vòng lại từ đầu, xóa hết để bắt đầu lại
            if (currentOutputIndex === 0) {
                clearAllOutputs();
            }
            responseOutputs[currentOutputIndex].value = text + '\n';
        } else {
            // Thêm text vào dòng mới
            currentOutput.value = currentOutput.value + text + '\n';
        }
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
            if (allAccRadio.checked) {
                // Load and combine accounts from both files
                const mainResponse = await fetch("./src/acc_main.json");
                const cloneResponse = await fetch("./src/acc_clone.json");
                const mainAccounts = await mainResponse.json();
                const cloneAccounts = await cloneResponse.json();
                currentAccounts = [...mainAccounts, ...cloneAccounts];
            } else {
                const response = await fetch(currentFilePath);
                currentAccounts = await response.json();
            }
            populateAccountGrid(currentAccounts);
        } catch (error) {
            console.error("Failed to load accounts:", error);
            appendToOutput(`[*] Error: Failed to load accounts from ${currentFilePath}`);
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

    allAccRadio.addEventListener("change", () => {
        if (allAccRadio.checked) {
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

        // Clear all outputs before starting new submission
        clearAllOutputs();

        try {
            for (const checkbox of selectedCheckboxes) {
                const account = currentAccounts.find(acc => acc.roleId === checkbox.value);
                if (!account) {
                    appendToOutput(`Error: Account with ID ${checkbox.value} not found.`);
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
                        appendToOutput(`[*] Success: ${account.roleName.padEnd(15)} - Response: ${result?.status}`);
                    } catch (error) {
                        appendToOutput(`[*] Error:   ${account.roleName.padEnd(15)} - Response: ${error.response?.data?.message}`);
                    }
                }
                await delay(1000);
            }
        } catch (error) {
            console.error("Error:", error);
            appendToOutput("Error occurred while processing request");
        }
    });
    
    fetchAccounts();
});
