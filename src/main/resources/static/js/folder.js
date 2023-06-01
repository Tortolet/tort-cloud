const URL = 'http://localhost:8080/'

if (localStorage.getItem("pinnedFolder") === "true") {
    const toastLive = document.getElementById('liveToast')
    const toast = new bootstrap.Toast(toastLive)
    toast.show()
}

if (localStorage.getItem("pinnedFolder") === "false") {
    const toastLive = document.getElementById('unpinToast')
    const toast = new bootstrap.Toast(toastLive)
    toast.show()
}

if(localStorage.getItem("pinnedFile") === "true"){
    const toastLive = document.getElementById('pinFile')
    const toast = new bootstrap.Toast(toastLive)
    toast.show()
}

if(localStorage.getItem("pinnedFile") === "false"){
    const toastLive = document.getElementById('unpinFile')
    const toast = new bootstrap.Toast(toastLive)
    toast.show()
}

localStorage.removeItem("count");
localStorage.removeItem("pinnedFolder");
localStorage.removeItem("pinnedFile");

function success() {
    document.getElementById('submitButton').disabled = document.getElementById("editingNameFolder").value === "";
}

function successCreateInput() {
    document.getElementById('createFolderSubmitButton').disabled = document.getElementById("creatingFolderInput").value === "";
}

async function cal() {
    const filesBytes = await fetch('http://localhost:8080/api/get_bytes')
    const filesBytesRes = await filesBytes.json();

    const userStorage = await fetch('http://localhost:8080/api/get_user_storage')
    const userStorageRes = await userStorage.json();

    const filesBytesSI = await fetch('http://localhost:8080/api/get_bytes_si')
    const filesBytesSIRes = await filesBytesSI.text();

    const userStorageSI = await fetch('http://localhost:8080/api/get_bytes_si_by_user')
    const userStorageSIRes = await userStorageSI.text();

    let resultBytes = filesBytesRes * 100 / userStorageRes
    console.log(Math.round(resultBytes))

    const bar = document.getElementById('progressBarStorage')
    const labelStorage = document.getElementById('dataLabel')
    bar.innerHTML = `<div class="progress-bar" aria-valuenow="${resultBytes}" aria-valuemin="0" aria-valuemax="100" style="width: ${resultBytes}%;"></div>`
    labelStorage.textContent += ` ${filesBytesSIRes} из ${userStorageSIRes}`
}

function addNewFolders() {
    const uuid = getPathVariableUuid();
    let formData = new FormData();
    const fileField = document.querySelector('#uploadFolders');
    for (let i = 0; i < fileField.files.length; i++) {
        formData.append('files', fileField.files[i])
    }

    fetch('http://localhost:8080/api/add_folders', {
        method: "POST",
        headers: {
            'folderUUID': uuid
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.text();
        })
        .then(data => {
            console.log(data)
            location.reload();
        })
        .catch(reason => {
            let errorJSON = JSON.parse(reason.message);

            //alert(test.message);
            console.log(`Тест: ${errorJSON.message}`);
            const errorAddNewFolders = document.getElementById('error-addFolders')
            errorAddNewFolders.innerHTML = `<div class="alert alert-danger">${errorJSON.message}</div>`
        })
}

function addNewFiles() {
    const uuid = getPathVariableUuid()
    fetch('http://localhost:8080/api/get_folder_uuid/' + uuid)
        .then(response => {
            if(!response.ok) {
                return response.text().then(text => {throw Error(text)})
            }
            return response.json();
        })
        .then(data => {
            console.log(data);

            let formData2 = new FormData();
            const fileFieldFile = document.querySelector('#uploadFiles');
            for (let i = 0; i < fileFieldFile.files.length; i++) {
                formData2.append('files', fileFieldFile.files[i])
            }

            fetch('http://localhost:8080/api/add_files', {
                method: "POST",
                headers: {
                    'folderId' : data.id
                },
                body: formData2
            })
                .then(response => {
                    if(!response.ok){
                        return response.text().then(text => { throw Error(text)})
                    }
                    return response.text();
                })
                .then(data => {
                    console.log(data)
                    location.reload();
                })
                .catch(reason => {
                    let errorJSON = JSON.parse(reason.message);
                    const errorModalFile = document.getElementById('error-addFiles')
                    errorModalFile.innerHTML = `<div class="alert alert-danger">${errorJSON.message}</div>`
                })
        })
}

const uploadFolders = document.getElementById('submit-add-new-folders')
uploadFolders.addEventListener('click', () => {
    addNewFolders()
})

const uploadFiles = document.getElementById('submit-add-new-files')
uploadFiles.addEventListener('click', () => {
    addNewFiles()
})

function updatePassword() {
    fetch('http://localhost:8080/api/update_user_password', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'oldPassword' : document.getElementById('editingOldPass').value,
            'newPassword' : document.getElementById('editingNewPass').value,
            'newPasswordConfirm' : document.getElementById('editingNewPassConfirm').value
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.text()
        })
        .then(data => {
            const successAlert = document.getElementById('password-notify')
            successAlert.innerHTML = `<div class="alert alert-success">${data}</div>`
        })
        .catch(response => {
            const errorModal = document.getElementById('password-notify')
            errorModal.innerHTML = `<div class="alert alert-danger">${response.message}</div>`
        })
}

const updatePasswordButton = document.getElementById("submitEditPasswordButton")
updatePasswordButton.addEventListener('click', () => {
    updatePassword()
})

const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

const emailInput = document.querySelector('#editingMail');
const emailAccessInput = document.querySelector('#addNewAccess');

const emailVal = document.querySelector('#emailValidation');
const emailValAccess = document.querySelector('#emailValidationAccess');

function onInput() {
    const buttonEditEmail = document.getElementById('submitEditMailButton');
    if (isEmailValid(emailInput.value)) {
        emailInput.classList.remove("border-danger");
        emailInput.classList.add('border-success');
        emailVal.innerHTML = `<p class="text-start text-success" style="font-size: 80%">Почта написана верно</p>`;
        buttonEditEmail.disabled = false;
    } else {
        emailInput.classList.remove("border-success");
        emailInput.classList.add('border-danger');
        emailVal.innerHTML = `<p class="text-start text-danger" style="font-size: 80%">Некорректная почта</p>`;
        buttonEditEmail.disabled = true;
    }
}

function onInputAccess() {
    const buttonAddAccess = document.getElementById('submit-add-new-access');
    if (isEmailValid(emailAccessInput.value)) {
        emailAccessInput.classList.remove("border-danger");
        emailAccessInput.classList.add('border-success');
        emailValAccess.innerHTML = `<p class="text-start text-success" style="font-size: 80%">Почта написана верно</p>`;
        buttonAddAccess.disabled = false;
    } else {
        emailAccessInput.classList.remove("border-success");
        emailAccessInput.classList.add('border-danger');
        emailValAccess.innerHTML = `<p class="text-start text-danger" style="font-size: 80%">Некорректная почта</p>`;
        buttonAddAccess.disabled = true;
    }
}

emailInput.addEventListener('input', onInput);
emailAccessInput.addEventListener('input', onInputAccess);

function isEmailValid(value) {
    return EMAIL_REGEXP.test(value);
}

function updateEmail() {
    fetch('http://localhost:8080/api/update_email', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'email' : document.getElementById('editingMail').value
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.json()
        })
        .then(data => {
            window.location = URL + 'logout'
        })
        .catch(response => {
            let error = JSON.parse(response.message);
            console.log(`Тест: ${error.message}`);

            const errorModal = document.getElementById('mail-notify')
            errorModal.innerHTML = `<div class="alert alert-danger">${error.message}</div>`
        })
}

const updateEmailButton = document.getElementById("submitEditMailButton")
updateEmailButton.addEventListener('click', () => {
    updateEmail()
})

function sentEmail() {
    fetch('http://localhost:8080/api/sent_message_to_admin', {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'Content-Type': 'text/plain'
        },
        body: document.getElementById('textareaForDev').value
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.json()
        })
        .then(data => {
            const successAlert = document.getElementById('notify-feedback')
            successAlert.innerHTML = `<div class="alert alert-success">Вы успешно отправили сообщение</div>`

            const sentMessageButton = document.getElementById("submitTextForDevButton")
            sentMessageButton.classList.remove('placeholder-glow')
            sentMessageButton.disabled = false
            sentMessageButton.textContent = 'Отправить'
        })
        .catch(response => {
            let error = JSON.parse(response.message);
            console.log(`Тест: ${error.message}`);

            const errorModal = document.getElementById('notify-feedback')
            errorModal.innerHTML = `<div class="alert alert-danger">${error.message}</div>`
        })
}

const sentMessageButton = document.getElementById("submitTextForDevButton")
sentMessageButton.addEventListener('click', () => {
    sentMessageButton.classList.add('placeholder-glow')
    sentMessageButton.disabled = true
    sentMessageButton.textContent = 'Отправка...'
    sentEmail()
})

fetch('http://localhost:8080/api/get_user')
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw Error(text)
            })
        }
        return response.json()
    })
    .then(result => {
        localStorage.setItem('company_id', result.companies.id)
    })
    .catch(response => {
        let error = JSON.parse(response.message);
        console.log(`Тест: ${error.message}`);
    })

function addAccess() {
    fetch('http://localhost:8080/api/create_access', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'companyId' : localStorage.getItem('company_id')
        },
        body: JSON.stringify({
            "email": document.getElementById('addNewAccess').value
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.json()
        })
        .then(data => {
            const successAlert = document.getElementById('notify-addAccess')
            successAlert.innerHTML = `<div class="alert alert-success">Вы успешно добавили доступ</div>`
            localStorage.removeItem('company_id')
        })
        .catch(response => {
            let error = JSON.parse(response.message);
            console.log(`Тест: ${error.message}`);

            const errorModal = document.getElementById('notify-addAccess')
            errorModal.innerHTML = `<div class="alert alert-danger">${error.message}</div>`
        })
}

const addNewAccessButton = document.getElementById("submit-add-new-access")
addNewAccessButton.addEventListener('click', () => {
    addAccess()
})

function createFolder(folderId) {
    fetch('http://localhost:8080/api/create_folder', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'folderId': folderId
        },
        body: JSON.stringify({
            "name": document.getElementById('creatingFolderInput').value
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.json()
        })
        .then(data => {
            location.reload()
        })
        .catch(response => {
            let error = JSON.parse(response.message);
            console.log(`Тест: ${error.message}`);

            const errorModal = document.getElementById('error-createFolder')
            errorModal.innerHTML = `<div class="alert alert-danger">${error.message}</div>`
        })
}

function editFolderName(uuidModal) {
    fetch('http://localhost:8080/api/edit_folder_name', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'uuid': uuidModal
        },
        body: JSON.stringify({
            "name": document.getElementById('editingNameFolder').value
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.json()
        })
        .then(data => {
            location.reload()
        })
        .catch(response => {
            let error = JSON.parse(response.message);
            console.log(`Тест: ${error.message}`);

            const errorModal = document.getElementById('errors')
            errorModal.innerHTML = `<div class="alert alert-danger">${error.message}</div>`
        })
}

function editFileName(id) {
    fetch('http://localhost:8080/api/update_location', {
        method: 'PUT',
        headers: {
            'Accept': '*/*',
            'Content-Type': 'plain/text',
            'id': id
        },
        body: document.getElementById('editFileInput').value
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.json()
        })
        .then(data => {
            location.reload()
        })
        .catch(response => {
            let error = JSON.parse(response.message);
            console.log(`Тест: ${error.message}`);

            const errorModal = document.getElementById('error-editFile')
            errorModal.innerHTML = `<div class="alert alert-danger">${error.message}</div>`
        })
}

function deleteFolder(folderId) {
    fetch('http://localhost:8080/api/folder_to_trash', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'folderId': folderId
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.json()
        })
        .then(data => {
            location.reload()
        })
        .catch(response => {
            console.log('Ошибка удаления папки')
        })
}

function deleteFile(fileId) {
    fetch('http://localhost:8080/api/file_to_trash', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'id': fileId
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.json()
        })
        .then(data => {
            location.reload()
        })
        .catch(response => {
            console.log('Ошибка удаления папки')
        })
}

function pinFolder(uuid) {
    fetch('http://localhost:8080/api/pin_folder/' + uuid, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            return response.text()
        })
    location.reload()
}


function pinFile(id) {
    fetch('http://localhost:8080/api/pin_file', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'id': id
        }
    })
        .then(response => {
            return response.json()
        })
    localStorage.setItem("pinnedFile", "true")
    location.reload()
}

function unpinFile(id) {
    fetch('http://localhost:8080/api/unpin_file', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'id': id
        }
    })
        .then(response => {
            return response.json()
        })
    localStorage.setItem("pinnedFile", "false")
    location.reload()
}

function download(uuid, nameZip) {
    // Create AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/download?uuid=' + encodeURIComponent(uuid), true);
    xhr.responseType = 'blob';

    // Handle AJAX response
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Create blob URL from response data
            const blob = new Blob([xhr.response], {type: xhr.getResponseHeader('Content-Type')});
            const url = window.URL.createObjectURL(blob);

            // Open file in new tab with custom file name
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nameZip);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Send AJAX request
    xhr.send();
}

function downloadFile(id, customName) {
    // Create AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/download-file?id=' + encodeURIComponent(id), true);
    xhr.responseType = 'blob';

    // Handle AJAX response
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Create blob URL from response data
            const blob = new Blob([xhr.response], {type: xhr.getResponseHeader('Content-Type')});
            const url = window.URL.createObjectURL(blob);

            // Open file in new tab with custom file name
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', customName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Send AJAX request
    xhr.send();
}

function unpinFolder(uuid) {
    fetch('http://localhost:8080/api/unpin_folder/' + uuid, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            return response.text()
        })
    location.reload()
}

function getNavigationOfFolders() {
    const uuid = getPathVariableUuid();
    fetch('http://localhost:8080/api/get_all_path', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'uuid': uuid
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.json();
        })
        .then(data => {
            const navigationItems = document.getElementById('navigation-items')
            for (let i = 0; i < data.length; i++) {
                navigationItems.innerHTML += `<li class="breadcrumb-item"><a id="href-${data[i].id}" href="/main/${data[i].uuid}"><span id="item-${data[i].id}">${data[i].name}</span></a></li>`
            }
            const firstElement = document.getElementById(`item-${data[0].id}`)
            const firstElementHref = document.getElementById(`href-${data[0].id}`)
            firstElement.textContent = 'Главная'
            firstElementHref.href = "/main"
        })
        .catch(response => {
            window.location = URL + '404'
        })
}

function shareFolder(uuid) {
    fetch('http://localhost:8080/api/share_folder/' + uuid, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            return response.text()
        })
}

function unShareFolder(uuid) {
    fetch('http://localhost:8080/api/unshared_folder/' + uuid, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            return response.text()
        })
}

function shareFile(id) {
    fetch('http://localhost:8080/api/share_file', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'id': id
        }
    })
        .then(response => {
            return response.text()
        })
}

function unShareFile(id) {
    fetch('http://localhost:8080/api/share_file_false', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'id': id
        }
    })
        .then(response => {
            return response.text()
        })
}

function viewFile(id, customFileName) {
    let filename = transliterate(customFileName)

    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/view?id=' + encodeURIComponent(id), true);
    xhr.setRequestHeader('Custom-File-Name', encodeURIComponent(filename) || '');

    xhr.responseType = 'blob';

    xhr.onload = function() {
        if (xhr.status === 200) {
            const blob = xhr.response;
            const url = (window.URL || window.webkitURL).createObjectURL(blob);
            const contentType = xhr.getResponseHeader('Content-Type');
            if (contentType !== 'application/octet-stream'){
                window.open(url);
            }
            if (contentType === 'application/octet-stream'){
                const a = document.createElement('a');
                a.href = url;
                a.download = customFileName || id;
                a.click();
            }

        } else {
            console.error('Error:', xhr.statusText);
        }
    };

    xhr.onerror = function() {
        console.error('Network error occurred');
    };

    xhr.send();

}

function transliterate(word){
    let answer = ""
        , a = {};

    a["Ё"]="YO";a["Й"]="I";a["Ц"]="TS";a["У"]="U";a["К"]="K";a["Е"]="E";a["Н"]="N";a["Г"]="G";a["Ш"]="SH";a["Щ"]="SCH";a["З"]="Z";a["Х"]="H";a["Ъ"]="'";
    a["ё"]="yo";a["й"]="i";a["ц"]="ts";a["у"]="u";a["к"]="k";a["е"]="e";a["н"]="n";a["г"]="g";a["ш"]="sh";a["щ"]="sch";a["з"]="z";a["х"]="h";a["ъ"]="'";
    a["Ф"]="F";a["Ы"]="I";a["В"]="V";a["А"]="A";a["П"]="P";a["Р"]="R";a["О"]="O";a["Л"]="L";a["Д"]="D";a["Ж"]="ZH";a["Э"]="E";
    a["ф"]="f";a["ы"]="i";a["в"]="v";a["а"]="a";a["п"]="p";a["р"]="r";a["о"]="o";a["л"]="l";a["д"]="d";a["ж"]="zh";a["э"]="e";
    a["Я"]="Ya";a["Ч"]="CH";a["С"]="S";a["М"]="M";a["И"]="I";a["Т"]="T";a["Ь"]="'";a["Б"]="B";a["Ю"]="YU";
    a["я"]="ya";a["ч"]="ch";a["с"]="s";a["м"]="m";a["и"]="i";a["т"]="t";a["ь"]="'";a["б"]="b";a["ю"]="yu";

    for (i in word){
        if (word.hasOwnProperty(i)) {
            if (a[word[i]] === undefined){
                answer += word[i];
            } else {
                answer += a[word[i]];
            }
        }
    }
    return answer;
}

function getFolders() {
    const uuid = getPathVariableUuid();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const folderSort = urlParams.get('folderSort')

    const sortButton = document.getElementById('name-sort')
    sortButton.classList.remove('active')
    sortButton?.addEventListener("click", function () {
        window.location = URL + 'main/' + uuid + '?folderSort=asc'
    }, true);

    const defaultSortButton = document.getElementById('default-sort')
    defaultSortButton.classList.remove('active')
    defaultSortButton?.addEventListener("click", function () {
        window.location = URL + 'main/' + uuid
    }, true);

    const dateSortButton = document.getElementById('date-sort')
    dateSortButton.classList.remove('active')
    dateSortButton?.addEventListener("click", function () {
        window.location = URL + 'main/' + uuid + '?folderSort=date-asc'
    }, true);

    if (folderSort !== null) {
        if (folderSort !== "asc" && folderSort !== "desc" && folderSort !== "date-asc" && folderSort !== "date-desc"){
            window.location = URL + '404'
        }

        if (folderSort === "asc") {
            sortButton.classList.add('active')
            sortButton?.addEventListener("click", function () {
                window.location = URL + 'main/' + uuid + '?folderSort=desc'
            }, true);
        }
        if (folderSort === "desc") {
            sortButton.classList.add('active')
            sortButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-alpha-down-alt" viewBox="0 0 16 16">
                                        <path d="M12.96 7H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V7z"/>
                                        <path fill-rule="evenodd" d="M10.082 12.629 9.664 14H8.598l1.789-5.332h1.234L13.402 14h-1.12l-.419-1.371h-1.781zm1.57-.785L11 9.688h-.047l-.652 2.156h1.351z"/>
                                        <path d="M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z"/>
                                    </svg>`
            sortButton?.addEventListener("click", function () {
                window.location = URL + 'main/' + uuid + '?folderSort=asc'
            }, true);
        }

        if (folderSort === "date-asc") {
            dateSortButton.classList.add('active')
            dateSortButton?.addEventListener("click", function () {
                window.location = URL + 'main/' + uuid + '?folderSort=date-desc'
            }, true);
        }
        if (folderSort === "date-desc") {
            dateSortButton.classList.add('active')
            dateSortButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-numeric-down-alt" viewBox="0 0 16 16">
                                          <path fill-rule="evenodd" d="M11.36 7.098c-1.137 0-1.708-.657-1.762-1.278h1.004c.058.223.343.45.773.45.824 0 1.164-.829 1.133-1.856h-.059c-.148.39-.57.742-1.261.742-.91 0-1.72-.613-1.72-1.758 0-1.148.848-1.836 1.973-1.836 1.09 0 2.063.637 2.063 2.688 0 1.867-.723 2.848-2.145 2.848zm.062-2.735c.504 0 .933-.336.933-.972 0-.633-.398-1.008-.94-1.008-.52 0-.927.375-.927 1 0 .64.418.98.934.98z"/>
                                          <path d="M12.438 8.668V14H11.39V9.684h-.051l-1.211.859v-.969l1.262-.906h1.046zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z"/>
                                        </svg>`
            dateSortButton?.addEventListener("click", function () {
                window.location = URL + 'main/' + uuid + '?folderSort=date-asc'
            }, true);
        }

        const uuid = getPathVariableUuid();
        fetch('http://localhost:8080/api/get_folders_uuid/' + uuid + '?folderSort=' + folderSort)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw Error(text)
                    })
                }
                return response.json();
            })
            .then(data => {
                console.log(data);

                const folderContent = document.getElementById('folderContent')
                const folderCount = document.getElementById('foldersCount')
                let count = 0

                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].inTrash === false) {
                            let date = data[i].dateCreated.slice(0, 10)
                            let day = date.slice(8, 10)
                            let month = date.slice(5, 7)
                            let year = date.slice(0, 4)
                            if (data[i].bookmark === false) {
                                folderContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a>  <ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder" href="#" id="${data[i].uuid}">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item share-folder" href="#" data-bs-toggle="modal" data-bs-target="#shareModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-folder fa-solid"></i></div><a href="/main/${data[i].uuid}" style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].name}</p><small><span id="size-${data[i].uuid}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if (data[i].bookmark === true) {
                                folderContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a>  <ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder" href="#" id="${data[i].uuid}">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item share-folder" href="#" data-bs-toggle="modal" data-bs-target="#shareModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-folder fa-solid"></i></div><a href="/main/${data[i].uuid}" style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].name} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].uuid}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            fetch('http://localhost:8080/api/get_bytes_folder/' + data[i].uuid)
                                .then(response => {
                                    return response.text()
                                })
                                .then(bytes => {
                                    let size = document.getElementById('size-' + data[i].uuid)
                                    size.textContent += `${bytes}`
                                })
                            count++
                        }
                    }

                    const unpinButton = document.querySelectorAll('.unpin-folder')
                    const pinButton = document.querySelectorAll('.pin-folder')
                    const downloadButton = document.querySelectorAll('.download-button')
                    const editButton = document.querySelectorAll('.edit-folder')
                    const infoButton = document.querySelectorAll('.info-folder')
                    const deleteButton = document.querySelectorAll('.delete-folder')
                    const shareButton = document.querySelectorAll('.share-folder')
                    let idModal;
                    let uuidModal;
                    for (let j = 0; j < data.length; j++) {
                        downloadButton[j]?.addEventListener("click", function () {
                            download(data[j].uuid, data[j].name)
                        }, true);
                        editButton[j]?.addEventListener("click", function () {
                            let nameFolder = document.getElementById('editingNameFolder');
                            nameFolder.value = data[j].name
                            uuidModal = data[j].uuid;
                        }, true);
                        deleteButton[j]?.addEventListener("click", function () {
                            idModal = data[j].id;
                        }, true);
                        shareButton[j]?.addEventListener("click", function () {
                            uuidModal = data[j].uuid;
                            const statusShare = document.getElementById('status-share')
                            const submitShare = document.getElementById('submit-share')
                            const cancelShare = document.getElementById('cancel-share')
                            const shareLink = document.getElementById('shared-link')
                            shareLink.value = URL + 'shared-folders/' + uuidModal
                            if (data[j].shared === true) {
                                statusShare.classList.remove('text-danger')
                                statusShare.classList.add('text-success')
                                statusShare.textContent = 'Да'
                                cancelShare.disabled = false
                            }
                            if (data[j].shared === false) {
                                statusShare.classList.remove('text-success')
                                statusShare.classList.add('text-danger')
                                statusShare.textContent = 'Нет'
                                submitShare.disabled = false
                            }
                        }, true);
                        infoButton[j]?.addEventListener("click", function () {
                            let infoDate = data[j].dateCreated.slice(0, 10)
                            let infoDay = infoDate.slice(8, 10)
                            let infoMonth = infoDate.slice(5, 7)
                            let infoYear = infoDate.slice(0, 4)
                            let infoTime = data[j].dateCreated.slice(11, data[j].dateCreated.length - 7)

                            let infoDateModified = data[j].dateModified.slice(0, 10)
                            let infoDayModified = infoDateModified.slice(8, 10)
                            let infoMonthModified = infoDateModified.slice(5, 7)
                            let infoYearModified = infoDateModified.slice(0, 4)
                            let infoTimeModified = data[j].dateModified.slice(11, data[j].dateModified.length - 7)

                            let infoName = data[j].name
                            let infoSize = document.getElementById('size-' + data[j].uuid)
                            let infoUser = data[j].users.username
                            let infoDateCreated = infoDay + '.' + infoMonth + '.' + infoYear + ' ' + infoTime
                            let infoDateMod = infoDayModified + '.' + infoMonthModified + '.' + infoYearModified + ' ' + infoTimeModified
                            let infoPin = data[j].bookmark

                            const infoNameFolder = document.getElementById('infoNameFolder')
                            const infoSizeFolder = document.getElementById('infoSizeFolder')
                            const infoUserFolder = document.getElementById('infoUserFolder')
                            const infoDateFolder = document.getElementById('infoDateFolder')
                            const infoDateModFolder = document.getElementById('infoDateModFolder')
                            const infoBookmarkFolder = document.getElementById('infoBookmarkFolder')
                            const infoBookmarkFolderTrueFalse = document.getElementById('infoBookmarkFolderTrueFalse')

                            if (infoPin) {
                                infoPin = 'Да'
                                infoBookmarkFolderTrueFalse.classList.remove('text-danger')
                                infoBookmarkFolderTrueFalse.classList.add('text-success')
                            }
                            if (!infoPin) {
                                infoPin = 'Нет'
                                infoBookmarkFolderTrueFalse.classList.remove('text-success')
                                infoBookmarkFolderTrueFalse.classList.add('text-danger')
                            }

                            infoNameFolder.textContent = 'Название: ' + infoName
                            infoSizeFolder.textContent = infoSize.textContent
                            infoUserFolder.textContent = 'Владелец: ' + infoUser
                            infoDateFolder.textContent = 'Дата создания: ' + infoDateCreated
                            infoDateModFolder.textContent = 'Дата изменения: ' + infoDateMod
                            infoBookmarkFolder.textContent = 'Закреплено: '
                            infoBookmarkFolderTrueFalse.textContent = infoPin
                        }, true);
                    }

                    for (let j = 0; j < unpinButton.length; j++) {
                        unpinButton[j]?.addEventListener("click", function () {
                            unpinFolder(unpinButton[j].id)
                            localStorage.setItem("pinnedFolder", "false")
                        }, true);
                    }

                    for (let j = 0; j < pinButton.length; j++) {
                        pinButton[j]?.addEventListener("click", function () {
                            pinFolder(pinButton[j].id)
                            localStorage.setItem("pinnedFolder", "true")
                        }, true);
                    }

                    const submitEditButton = document.getElementById('submitButton')
                    submitEditButton.addEventListener('click', function () {
                        editFolderName(uuidModal)
                    }, true)

                    const deleteFolderButton = document.getElementById('deleteFolderButton')
                    deleteFolderButton.addEventListener('click', function () {
                        deleteFolder(idModal)
                    }, true)

                    const submitShareButton = document.getElementById('submit-share')
                    submitShareButton.addEventListener('click', function () {
                        shareFolder(uuidModal)
                        const status = document.getElementById('status-share')
                        const submitShare = document.getElementById('submit-share')
                        const cancelShare = document.getElementById('cancel-share')
                        status.classList.remove('text-danger')
                        status.classList.add('text-success')
                        status.textContent = 'Да'
                        cancelShare.disabled = false
                        submitShare.disabled = true
                    })

                    const unShareButton = document.getElementById('cancel-share')
                    unShareButton.addEventListener('click', function () {
                        unShareFolder(uuidModal)
                        const status = document.getElementById('status-share')
                        const submitShare = document.getElementById('submit-share')
                        const cancelShare = document.getElementById('cancel-share')
                        status.classList.remove('text-success')
                        status.classList.add('text-danger')
                        status.textContent = 'Нет'
                        cancelShare.disabled = true
                        submitShare.disabled = false
                    })

                }
                folderCount.textContent += ` (${count})`
                const testBut = document.getElementById('createFolderSubmitButton')
                testBut.addEventListener('click', function () {
                    fetch('http://localhost:8080/api/get_folder_uuid/' + getPathVariableUuid())
                        .then(response => {
                            return response.json()
                        })
                        .then(data => {
                            createFolder(data.id)
                        })
                })
            })
            .catch(response => {
                window.location = URL + '404'
            })
    }

    if (folderSort === null) {
        const uuid = getPathVariableUuid();
        fetch('http://localhost:8080/api/get_folders_uuid/' + uuid)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw Error(text)
                    })
                }
                return response.json();
            })
            .then(data => {
                console.log(data);

                const folderContent = document.getElementById('folderContent')
                const folderCount = document.getElementById('foldersCount')
                let count = 0

                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].inTrash === false) {
                            let date = data[i].dateCreated.slice(0, 10)
                            let day = date.slice(8, 10)
                            let month = date.slice(5, 7)
                            let year = date.slice(0, 4)
                            if (data[i].bookmark === false) {
                                folderContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a>  <ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder" href="#" id="${data[i].uuid}">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item share-folder" href="#" data-bs-toggle="modal" data-bs-target="#shareModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-folder fa-solid"></i></div><a href="/main/${data[i].uuid}" style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].name}</p><small><span id="size-${data[i].uuid}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if (data[i].bookmark === true) {
                                folderContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a>  <ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder" href="#" id="${data[i].uuid}">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item share-folder" href="#" data-bs-toggle="modal" data-bs-target="#shareModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-folder fa-solid"></i></div><a href="/main/${data[i].uuid}" style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].name} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].uuid}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            fetch('http://localhost:8080/api/get_bytes_folder/' + data[i].uuid)
                                .then(response => {
                                    return response.text()
                                })
                                .then(bytes => {
                                    let size = document.getElementById('size-' + data[i].uuid)
                                    size.textContent += `${bytes}`
                                })
                            count++
                        }
                    }

                    const unpinButton = document.querySelectorAll('.unpin-folder')
                    const pinButton = document.querySelectorAll('.pin-folder')
                    const downloadButton = document.querySelectorAll('.download-button')
                    const editButton = document.querySelectorAll('.edit-folder')
                    const infoButton = document.querySelectorAll('.info-folder')
                    const deleteButton = document.querySelectorAll('.delete-folder')
                    const shareButton = document.querySelectorAll('.share-folder')
                    let idModal;
                    let uuidModal;
                    for (let j = 0; j < data.length; j++) {
                        downloadButton[j]?.addEventListener("click", function () {
                            download(data[j].uuid, data[j].name)
                        }, true);
                        editButton[j]?.addEventListener("click", function () {
                            let nameFolder = document.getElementById('editingNameFolder');
                            nameFolder.value = data[j].name
                            uuidModal = data[j].uuid;
                        }, true);
                        deleteButton[j]?.addEventListener("click", function () {
                            idModal = data[j].id;
                        }, true);
                        shareButton[j]?.addEventListener("click", function () {
                            uuidModal = data[j].uuid;
                            const statusShare = document.getElementById('status-share')
                            const submitShare = document.getElementById('submit-share')
                            const cancelShare = document.getElementById('cancel-share')
                            const shareLink = document.getElementById('shared-link')
                            shareLink.value = URL + 'shared-folders/' + uuidModal
                            if (data[j].shared === true) {
                                statusShare.classList.remove('text-danger')
                                statusShare.classList.add('text-success')
                                statusShare.textContent = 'Да'
                                cancelShare.disabled = false
                            }
                            if (data[j].shared === false) {
                                statusShare.classList.remove('text-success')
                                statusShare.classList.add('text-danger')
                                statusShare.textContent = 'Нет'
                                submitShare.disabled = false
                            }
                        }, true);
                        infoButton[j]?.addEventListener("click", function () {
                            let infoDate = data[j].dateCreated.slice(0, 10)
                            let infoDay = infoDate.slice(8, 10)
                            let infoMonth = infoDate.slice(5, 7)
                            let infoYear = infoDate.slice(0, 4)
                            let infoTime = data[j].dateCreated.slice(11, data[j].dateCreated.length - 7)

                            let infoDateModified = data[j].dateModified.slice(0, 10)
                            let infoDayModified = infoDateModified.slice(8, 10)
                            let infoMonthModified = infoDateModified.slice(5, 7)
                            let infoYearModified = infoDateModified.slice(0, 4)
                            let infoTimeModified = data[j].dateModified.slice(11, data[j].dateModified.length - 7)

                            let infoName = data[j].name
                            let infoSize = document.getElementById('size-' + data[j].uuid)
                            let infoUser = data[j].users.username
                            let infoDateCreated = infoDay + '.' + infoMonth + '.' + infoYear + ' ' + infoTime
                            let infoDateMod = infoDayModified + '.' + infoMonthModified + '.' + infoYearModified + ' ' + infoTimeModified
                            let infoPin = data[j].bookmark

                            const infoNameFolder = document.getElementById('infoNameFolder')
                            const infoSizeFolder = document.getElementById('infoSizeFolder')
                            const infoUserFolder = document.getElementById('infoUserFolder')
                            const infoDateFolder = document.getElementById('infoDateFolder')
                            const infoDateModFolder = document.getElementById('infoDateModFolder')
                            const infoBookmarkFolder = document.getElementById('infoBookmarkFolder')
                            const infoBookmarkFolderTrueFalse = document.getElementById('infoBookmarkFolderTrueFalse')

                            if (infoPin) {
                                infoPin = 'Да'
                                infoBookmarkFolderTrueFalse.classList.remove('text-danger')
                                infoBookmarkFolderTrueFalse.classList.add('text-success')
                            }
                            if (!infoPin) {
                                infoPin = 'Нет'
                                infoBookmarkFolderTrueFalse.classList.remove('text-success')
                                infoBookmarkFolderTrueFalse.classList.add('text-danger')
                            }

                            infoNameFolder.textContent = 'Название: ' + infoName
                            infoSizeFolder.textContent = infoSize.textContent
                            infoUserFolder.textContent = 'Владелец: ' + infoUser
                            infoDateFolder.textContent = 'Дата создания: ' + infoDateCreated
                            infoDateModFolder.textContent = 'Дата изменения: ' + infoDateMod
                            infoBookmarkFolder.textContent = 'Закреплено: '
                            infoBookmarkFolderTrueFalse.textContent = infoPin
                        }, true);
                    }

                    for (let j = 0; j < unpinButton.length; j++) {
                        unpinButton[j]?.addEventListener("click", function () {
                            unpinFolder(unpinButton[j].id)
                            localStorage.setItem("pinnedFolder", "false")
                        }, true);
                    }

                    for (let j = 0; j < pinButton.length; j++) {
                        pinButton[j]?.addEventListener("click", function () {
                            pinFolder(pinButton[j].id)
                            localStorage.setItem("pinnedFolder", "true")
                        }, true);
                    }

                    const submitEditButton = document.getElementById('submitButton')
                    submitEditButton.addEventListener('click', function () {
                        editFolderName(uuidModal)
                    }, true)

                    const deleteFolderButton = document.getElementById('deleteFolderButton')
                    deleteFolderButton.addEventListener('click', function () {
                        deleteFolder(idModal)
                    }, true)

                    const submitShareButton = document.getElementById('submit-share')
                    submitShareButton.addEventListener('click', function () {
                        shareFolder(uuidModal)
                        const status = document.getElementById('status-share')
                        const submitShare = document.getElementById('submit-share')
                        const cancelShare = document.getElementById('cancel-share')
                        status.classList.remove('text-danger')
                        status.classList.add('text-success')
                        status.textContent = 'Да'
                        cancelShare.disabled = false
                        submitShare.disabled = true
                    })

                    const unShareButton = document.getElementById('cancel-share')
                    unShareButton.addEventListener('click', function () {
                        unShareFolder(uuidModal)
                        const status = document.getElementById('status-share')
                        const submitShare = document.getElementById('submit-share')
                        const cancelShare = document.getElementById('cancel-share')
                        status.classList.remove('text-success')
                        status.classList.add('text-danger')
                        status.textContent = 'Нет'
                        cancelShare.disabled = true
                        submitShare.disabled = false
                    })

                }
                folderCount.textContent += ` (${count})`
                const testBut = document.getElementById('createFolderSubmitButton')
                testBut.addEventListener('click', function () {
                    fetch('http://localhost:8080/api/get_folder_uuid/' + getPathVariableUuid())
                        .then(response => {
                            return response.json()
                        })
                        .then(data => {
                            createFolder(data.id)
                        })
                })
            })
            .catch(response => {
                window.location = URL + '404'
            })
    }
}

function getFiles() {
    const uuid = getPathVariableUuid();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const fileSort = urlParams.get('fileSort')

    const sortButton = document.getElementById('name-sort-file')
    sortButton.classList.remove('active')
    sortButton?.addEventListener("click", function () {
        window.location = URL + 'main/' + uuid +'?fileSort=asc'
    }, true);

    const defaultSortButton = document.getElementById('default-sort-file')
    defaultSortButton.classList.remove('active')
    defaultSortButton?.addEventListener("click", function () {
        window.location = URL + 'main/' + uuid
    }, true);

    const dateSortButton = document.getElementById('date-sort-file')
    dateSortButton.classList.remove('active')
    dateSortButton?.addEventListener("click", function () {
        window.location = URL + 'main/' + uuid + '?fileSort=date-asc'
    }, true);

    if (fileSort !== null) {
        if (fileSort !== "asc" && fileSort !== "desc" && fileSort !== "date-asc" && fileSort !== "date-desc") {
            window.location = URL + '404'
        }

        if (fileSort === "asc") {
            sortButton.classList.add('active')
            sortButton?.addEventListener("click", function () {
                window.location = URL + 'main/' + uuid + '?fileSort=desc'
            }, true);
        }
        if (fileSort === "desc") {
            sortButton.classList.add('active')
            sortButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-alpha-down-alt" viewBox="0 0 16 16">
                                        <path d="M12.96 7H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V7z"/>
                                        <path fill-rule="evenodd" d="M10.082 12.629 9.664 14H8.598l1.789-5.332h1.234L13.402 14h-1.12l-.419-1.371h-1.781zm1.57-.785L11 9.688h-.047l-.652 2.156h1.351z"/>
                                        <path d="M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z"/>
                                    </svg>`
            sortButton?.addEventListener("click", function () {
                window.location = URL + 'main/' + uuid + '?fileSort=asc'
            }, true);
        }

        if (fileSort === "date-asc") {
            dateSortButton.classList.add('active')
            dateSortButton?.addEventListener("click", function () {
                window.location = URL + 'main/' + uuid + '?fileSort=date-desc'
            }, true);
        }
        if (fileSort === "date-desc") {
            dateSortButton.classList.add('active')
            dateSortButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sort-numeric-down-alt" viewBox="0 0 16 16">
                                          <path fill-rule="evenodd" d="M11.36 7.098c-1.137 0-1.708-.657-1.762-1.278h1.004c.058.223.343.45.773.45.824 0 1.164-.829 1.133-1.856h-.059c-.148.39-.57.742-1.261.742-.91 0-1.72-.613-1.72-1.758 0-1.148.848-1.836 1.973-1.836 1.09 0 2.063.637 2.063 2.688 0 1.867-.723 2.848-2.145 2.848zm.062-2.735c.504 0 .933-.336.933-.972 0-.633-.398-1.008-.94-1.008-.52 0-.927.375-.927 1 0 .64.418.98.934.98z"/>
                                          <path d="M12.438 8.668V14H11.39V9.684h-.051l-1.211.859v-.969l1.262-.906h1.046zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z"/>
                                        </svg>`
            dateSortButton?.addEventListener("click", function () {
                window.location = URL + 'main/' + uuid + '?fileSort=date-asc'
            }, true);
        }

        fetch('http://localhost:8080/api/get_files_folder/' + uuid + '?fileSort=' + fileSort)
            .then(response => {
                if(!response.ok) {
                    return response.text().then(text => {throw Error(text)})
                }
                return response.json();
            })
            .then(data => {
                console.log(data)
                const fileContent = document.getElementById('filesContent')
                const fileCount = document.getElementById('filesCount')
                fileCount.textContent += ` (${data.length})`

                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        let date = data[i].dateCreated.slice(0, 10)
                        let day = date.slice(8, 10)
                        let month = date.slice(5, 7)
                        let year = date.slice(0, 4)
                        if(data[i].bookmark === false) {
                            if(data[i].location.includes('.xls')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-table" style="color: #158a3c;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if(data[i].location.includes('.png') || data[i].location.includes('.jpg') || data[i].location.includes('.heic')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-image" style="color: #15328a;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if(data[i].location.includes('.mp4') || data[i].location.includes('.wav')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-video" style="color: #8a1515;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if(data[i].location.includes('.mp3')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-audio" style="color: #adcd0e;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if(data[i].location.includes('.java') || data[i].location.includes('.js') || data[i].location.includes('.html') || data[i].location.includes('.css') || data[i].location.includes('.py') || data[i].location.includes('.cs') || data[i].location.includes('.cpp')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-code" style="color: #158a7c;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if(!(data[i].location.includes('.java') || data[i].location.includes('.js') || data[i].location.includes('.html') || data[i].location.includes('.css') || data[i].location.includes('.py') || data[i].location.includes('.cs') || data[i].location.includes('.cpp') || data[i].location.includes('.mp3') || data[i].location.includes('.mp4') || data[i].location.includes('.wav') || data[i].location.includes('.png') || data[i].location.includes('.jpg') || data[i].location.includes('.heic') || data[i].location.includes('.xls'))) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                        }
                        if(data[i].bookmark === true) {
                            if(data[i].location.includes('.xls')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-table" style="color: #158a3c;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if(data[i].location.includes('.png') || data[i].location.includes('.jpg') || data[i].location.includes('.heic')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-image" style="color: #15328a;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if(data[i].location.includes('.mp4') || data[i].location.includes('.wav')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-video" style="color: #8a1515;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if(data[i].location.includes('.mp3')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-audio" style="color: #adcd0e;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if(data[i].location.includes('.java') || data[i].location.includes('.js') || data[i].location.includes('.html') || data[i].location.includes('.css') || data[i].location.includes('.py') || data[i].location.includes('.cs') || data[i].location.includes('.cpp')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-code" style="color: #158a7c;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></></a></div>
                                    </div>
                                </div>`
                            }
                            if(!(data[i].location.includes('.java') || data[i].location.includes('.js') || data[i].location.includes('.html') || data[i].location.includes('.css') || data[i].location.includes('.py') || data[i].location.includes('.cs') || data[i].location.includes('.cpp') || data[i].location.includes('.mp3') || data[i].location.includes('.mp4') || data[i].location.includes('.wav') || data[i].location.includes('.png') || data[i].location.includes('.jpg') || data[i].location.includes('.heic') || data[i].location.includes('.xls'))) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                        }
                        fetch('http://localhost:8080/api/get_bytes_file/' + data[i].id)
                            .then(response => {
                                return response.text()
                            })
                            .then(bytes => {
                                let size = document.getElementById('size-' + data[i].id)
                                size.textContent += `${bytes}`
                            })
                    }
                    const editButton = document.querySelectorAll('.edit-folder-file')
                    const shareButton = document.querySelectorAll('.share-file')
                    const infoButton = document.querySelectorAll('.info-folder-file')
                    const deleteButton = document.querySelectorAll('.delete-folder-file')
                    let idFile;
                    for (let j = 0; j < data.length; j++) {
                        editButton[j]?.addEventListener("click", function () {
                            let nameFile = document.getElementById('editFileInput');
                            nameFile.value = data[j].location.substring(0, data[j].location.indexOf("."))
                            idFile = data[j].id;
                        }, true);
                        deleteButton[j]?.addEventListener("click", function () {
                            idFile = data[j].id;
                        }, true);
                        shareButton[j]?.addEventListener("click", function () {
                            idFile = data[j].id;
                            const statusShare = document.getElementById('status-share-file')
                            const submitShare = document.getElementById('submit-share-file')
                            const cancelShare = document.getElementById('cancel-share-file')
                            const shareLink = document.getElementById('shared-link-file')
                            shareLink.value = URL + 'shared-files/' + idFile
                            if (data[j].shared === true) {
                                statusShare.classList.remove('text-danger')
                                statusShare.classList.add('text-success')
                                statusShare.textContent = 'Да'
                                cancelShare.disabled = false
                            }
                            if (data[j].shared === false) {
                                statusShare.classList.remove('text-success')
                                statusShare.classList.add('text-danger')
                                statusShare.textContent = 'Нет'
                                submitShare.disabled = false
                            }
                        }, true);
                        infoButton[j]?.addEventListener("click", function () {
                            let infoDateFile = data[j].dateCreated.slice(0, 10)
                            let infoDayFile = infoDateFile.slice(8, 10)
                            let infoMonthFile = infoDateFile.slice(5, 7)
                            let infoYearFile = infoDateFile.slice(0, 4)
                            let infoTimeFile = data[j].dateCreated.slice(11, data[j].dateCreated.length - 7)

                            let infoDateModifiedFile = data[j].dateModified.slice(0, 10)
                            let infoDayModifiedFile = infoDateModifiedFile.slice(8, 10)
                            let infoMonthModifiedFile = infoDateModifiedFile.slice(5, 7)
                            let infoYearModifiedFile = infoDateModifiedFile.slice(0, 4)
                            let infoTimeModifiedFile = data[j].dateModified.slice(11, data[j].dateModified.length - 7)

                            let infoNameFile = data[j].location
                            let infoSizeFile = document.getElementById('size-' + data[j].id)
                            let infoUserFile = data[j].users.username
                            let infoDateCreatedFile = infoDayFile + '.' + infoMonthFile + '.' + infoYearFile + ' ' + infoTimeFile
                            let infoDateModFile = infoDayModifiedFile + '.' + infoMonthModifiedFile + '.' + infoYearModifiedFile + ' ' + infoTimeModifiedFile
                            let infoPinFile = data[j].bookmark

                            const infoNameFolder = document.getElementById('infoNameFolder')
                            const infoSizeFolder = document.getElementById('infoSizeFolder')
                            const infoUserFolder = document.getElementById('infoUserFolder')
                            const infoDateFolder = document.getElementById('infoDateFolder')
                            const infoDateModFolder = document.getElementById('infoDateModFolder')
                            const infoBookmarkFolder = document.getElementById('infoBookmarkFolder')
                            const infoBookmarkFolderTrueFalse = document.getElementById('infoBookmarkFolderTrueFalse')

                            if(infoPinFile) {
                                infoPinFile = 'Да'
                                infoBookmarkFolderTrueFalse.classList.remove('text-danger')
                                infoBookmarkFolderTrueFalse.classList.add('text-success')
                            }
                            if(!infoPinFile) {
                                infoPinFile = 'Нет'
                                infoBookmarkFolderTrueFalse.classList.remove('text-success')
                                infoBookmarkFolderTrueFalse.classList.add('text-danger')
                            }

                            infoNameFolder.textContent = 'Название: ' + infoNameFile
                            infoSizeFolder.textContent = infoSizeFile.textContent
                            infoUserFolder.textContent = 'Владелец: ' + infoUserFile
                            infoDateFolder.textContent = 'Дата создания: ' + infoDateCreatedFile
                            infoDateModFolder.textContent = 'Дата изменения: ' + infoDateModFile
                            infoBookmarkFolder.textContent = 'Закреплено: '
                            infoBookmarkFolderTrueFalse.textContent = infoPinFile
                        }, true);
                    }
                    const submitEditFileButton = document.getElementById('editFileSubmitButton')
                    submitEditFileButton.addEventListener('click', function () {
                        editFileName(idFile)
                    }, true)

                    const submitShareButton = document.getElementById('submit-share-file')
                    submitShareButton.addEventListener('click', function () {
                        shareFile(idFile)
                        const status = document.getElementById('status-share-file')
                        const submitShare = document.getElementById('submit-share-file')
                        const cancelShare = document.getElementById('cancel-share-file')
                        status.classList.remove('text-danger')
                        status.classList.add('text-success')
                        status.textContent = 'Да'
                        cancelShare.disabled = false
                        submitShare.disabled = true
                    })

                    const unShareButton = document.getElementById('cancel-share-file')
                    unShareButton.addEventListener('click', function () {
                        unShareFile(idFile)
                        const status = document.getElementById('status-share-file')
                        const submitShare = document.getElementById('submit-share-file')
                        const cancelShare = document.getElementById('cancel-share-file')
                        status.classList.remove('text-success')
                        status.classList.add('text-danger')
                        status.textContent = 'Нет'
                        cancelShare.disabled = true
                        submitShare.disabled = false
                    })

                    const deleteFolderButton = document.getElementById('deleteFileButton')
                    deleteFolderButton.addEventListener('click', function () {
                        deleteFile(idFile)
                    }, true)
                }
            })
    }
    if (fileSort === null) {
        const uuid = getPathVariableUuid();
        fetch('http://localhost:8080/api/get_files_folder/' + uuid)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw Error(text)
                    })
                }
                return response.json();
            })
            .then(data => {
                console.log(data)
                const fileContent = document.getElementById('filesContent')
                const fileCount = document.getElementById('filesCount')
                fileCount.textContent += ` (${data.length})`

                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        let date = data[i].dateCreated.slice(0, 10)
                        let day = date.slice(8, 10)
                        let month = date.slice(5, 7)
                        let year = date.slice(0, 4)
                        if (data[i].bookmark === false) {
                            if (data[i].location.includes('.xls')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-table" style="color: #158a3c;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if (data[i].location.includes('.png') || data[i].location.includes('.jpg') || data[i].location.includes('.heic')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-image" style="color: #15328a;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if (data[i].location.includes('.mp4') || data[i].location.includes('.wav')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-video" style="color: #8a1515;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if (data[i].location.includes('.mp3')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-audio" style="color: #adcd0e;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if (data[i].location.includes('.java') || data[i].location.includes('.js') || data[i].location.includes('.html') || data[i].location.includes('.css') || data[i].location.includes('.py') || data[i].location.includes('.cs') || data[i].location.includes('.cpp')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-code" style="color: #158a7c;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if (!(data[i].location.includes('.java') || data[i].location.includes('.js') || data[i].location.includes('.html') || data[i].location.includes('.css') || data[i].location.includes('.py') || data[i].location.includes('.cs') || data[i].location.includes('.cpp') || data[i].location.includes('.mp3') || data[i].location.includes('.mp4') || data[i].location.includes('.wav') || data[i].location.includes('.png') || data[i].location.includes('.jpg') || data[i].location.includes('.heic') || data[i].location.includes('.xls'))) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="pinFile(${data[i].id})">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                        }
                        if (data[i].bookmark === true) {
                            if (data[i].location.includes('.xls')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-table" style="color: #158a3c;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if (data[i].location.includes('.png') || data[i].location.includes('.jpg') || data[i].location.includes('.heic')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-image" style="color: #15328a;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if (data[i].location.includes('.mp4') || data[i].location.includes('.wav')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-video" style="color: #8a1515;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if (data[i].location.includes('.mp3')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-audio" style="color: #adcd0e;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                            if (data[i].location.includes('.java') || data[i].location.includes('.js') || data[i].location.includes('.html') || data[i].location.includes('.css') || data[i].location.includes('.py') || data[i].location.includes('.cs') || data[i].location.includes('.cpp')) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-code" style="color: #158a7c;"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></></a></div>
                                    </div>
                                </div>`
                            }
                            if (!(data[i].location.includes('.java') || data[i].location.includes('.js') || data[i].location.includes('.html') || data[i].location.includes('.css') || data[i].location.includes('.py') || data[i].location.includes('.cs') || data[i].location.includes('.cpp') || data[i].location.includes('.mp3') || data[i].location.includes('.mp4') || data[i].location.includes('.wav') || data[i].location.includes('.png') || data[i].location.includes('.jpg') || data[i].location.includes('.heic') || data[i].location.includes('.xls'))) {
                                fileContent.innerHTML +=
                                    `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder-file" href="javascript:void(0);" id="${data[i].id}" onclick="unpinFile(${data[i].id})">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFile">Редактировать</a></li>
                                            <li><a class="dropdown-item share-file" data-bs-toggle="modal" data-bs-target="#shareFileModal">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFileModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                            }
                        }
                        fetch('http://localhost:8080/api/get_bytes_file/' + data[i].id)
                            .then(response => {
                                return response.text()
                            })
                            .then(bytes => {
                                let size = document.getElementById('size-' + data[i].id)
                                size.textContent += `${bytes}`
                            })
                    }
                    const editButton = document.querySelectorAll('.edit-folder-file')
                    const shareButton = document.querySelectorAll('.share-file')
                    const infoButton = document.querySelectorAll('.info-folder-file')
                    const deleteButton = document.querySelectorAll('.delete-folder-file')
                    let idFile;
                    for (let j = 0; j < data.length; j++) {
                        editButton[j]?.addEventListener("click", function () {
                            let nameFile = document.getElementById('editFileInput');
                            nameFile.value = data[j].location.substring(0, data[j].location.indexOf("."))
                            idFile = data[j].id;
                        }, true);
                        deleteButton[j]?.addEventListener("click", function () {
                            idFile = data[j].id;
                        }, true);
                        shareButton[j]?.addEventListener("click", function () {
                            idFile = data[j].id;
                            const statusShare = document.getElementById('status-share-file')
                            const submitShare = document.getElementById('submit-share-file')
                            const cancelShare = document.getElementById('cancel-share-file')
                            const shareLink = document.getElementById('shared-link-file')
                            shareLink.value = URL + 'shared-files/' + idFile
                            if (data[j].shared === true) {
                                statusShare.classList.remove('text-danger')
                                statusShare.classList.add('text-success')
                                statusShare.textContent = 'Да'
                                cancelShare.disabled = false
                            }
                            if (data[j].shared === false) {
                                statusShare.classList.remove('text-success')
                                statusShare.classList.add('text-danger')
                                statusShare.textContent = 'Нет'
                                submitShare.disabled = false
                            }
                        }, true);
                        infoButton[j]?.addEventListener("click", function () {
                            let infoDateFile = data[j].dateCreated.slice(0, 10)
                            let infoDayFile = infoDateFile.slice(8, 10)
                            let infoMonthFile = infoDateFile.slice(5, 7)
                            let infoYearFile = infoDateFile.slice(0, 4)
                            let infoTimeFile = data[j].dateCreated.slice(11, data[j].dateCreated.length - 7)

                            let infoDateModifiedFile = data[j].dateModified.slice(0, 10)
                            let infoDayModifiedFile = infoDateModifiedFile.slice(8, 10)
                            let infoMonthModifiedFile = infoDateModifiedFile.slice(5, 7)
                            let infoYearModifiedFile = infoDateModifiedFile.slice(0, 4)
                            let infoTimeModifiedFile = data[j].dateModified.slice(11, data[j].dateModified.length - 7)

                            let infoNameFile = data[j].location
                            let infoSizeFile = document.getElementById('size-' + data[j].id)
                            let infoUserFile = data[j].users.username
                            let infoDateCreatedFile = infoDayFile + '.' + infoMonthFile + '.' + infoYearFile + ' ' + infoTimeFile
                            let infoDateModFile = infoDayModifiedFile + '.' + infoMonthModifiedFile + '.' + infoYearModifiedFile + ' ' + infoTimeModifiedFile
                            let infoPinFile = data[j].bookmark

                            const infoNameFolder = document.getElementById('infoNameFolder')
                            const infoSizeFolder = document.getElementById('infoSizeFolder')
                            const infoUserFolder = document.getElementById('infoUserFolder')
                            const infoDateFolder = document.getElementById('infoDateFolder')
                            const infoDateModFolder = document.getElementById('infoDateModFolder')
                            const infoBookmarkFolder = document.getElementById('infoBookmarkFolder')
                            const infoBookmarkFolderTrueFalse = document.getElementById('infoBookmarkFolderTrueFalse')

                            if (infoPinFile) {
                                infoPinFile = 'Да'
                                infoBookmarkFolderTrueFalse.classList.remove('text-danger')
                                infoBookmarkFolderTrueFalse.classList.add('text-success')
                            }
                            if (!infoPinFile) {
                                infoPinFile = 'Нет'
                                infoBookmarkFolderTrueFalse.classList.remove('text-success')
                                infoBookmarkFolderTrueFalse.classList.add('text-danger')
                            }

                            infoNameFolder.textContent = 'Название: ' + infoNameFile
                            infoSizeFolder.textContent = infoSizeFile.textContent
                            infoUserFolder.textContent = 'Владелец: ' + infoUserFile
                            infoDateFolder.textContent = 'Дата создания: ' + infoDateCreatedFile
                            infoDateModFolder.textContent = 'Дата изменения: ' + infoDateModFile
                            infoBookmarkFolder.textContent = 'Закреплено: '
                            infoBookmarkFolderTrueFalse.textContent = infoPinFile
                        }, true);
                    }
                    const submitEditFileButton = document.getElementById('editFileSubmitButton')
                    submitEditFileButton.addEventListener('click', function () {
                        editFileName(idFile)
                    }, true)

                    const submitShareButton = document.getElementById('submit-share-file')
                    submitShareButton.addEventListener('click', function () {
                        shareFile(idFile)
                        const status = document.getElementById('status-share-file')
                        const submitShare = document.getElementById('submit-share-file')
                        const cancelShare = document.getElementById('cancel-share-file')
                        status.classList.remove('text-danger')
                        status.classList.add('text-success')
                        status.textContent = 'Да'
                        cancelShare.disabled = false
                        submitShare.disabled = true
                    })

                    const unShareButton = document.getElementById('cancel-share-file')
                    unShareButton.addEventListener('click', function () {
                        unShareFile(idFile)
                        const status = document.getElementById('status-share-file')
                        const submitShare = document.getElementById('submit-share-file')
                        const cancelShare = document.getElementById('cancel-share-file')
                        status.classList.remove('text-success')
                        status.classList.add('text-danger')
                        status.textContent = 'Нет'
                        cancelShare.disabled = true
                        submitShare.disabled = false
                    })

                    const deleteFolderButton = document.getElementById('deleteFileButton')
                    deleteFolderButton.addEventListener('click', function () {
                        deleteFile(idFile)
                    }, true)
                }
            })
    }
}

function getPathVariableUuid() {
    const res = window.location.pathname;
    return res.slice(6, res.length)
}

if (window.innerWidth < 768) {
    const test = document.getElementById('sidebar');
    test.classList.remove('border-end');
}

window.addEventListener('resize', function (event) {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 768) {
        sidebar.classList.remove('border-end');
    }

    if (window.innerWidth >= 768) {
        sidebar.classList.add('border-end');
    }
});

const logoutButton = document.getElementById('logout')
logoutButton.addEventListener('click', function () {
    localStorage.removeItem('company_id')
})

const copyButton = document.getElementById('copy-clip')
copyButton.addEventListener('click', async function () {
    let copyText = document.getElementById('shared-link')
    const shareToast = document.getElementById('shareToast')
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    await navigator.clipboard.writeText(copyText.value);

    const toastShare = new bootstrap.Toast(shareToast)
    toastShare.show()
})

const copyButtonFile = document.getElementById('copy-clip-file')
copyButtonFile.addEventListener('click', async function () {
    let copyText = document.getElementById('shared-link-file')
    const shareToast = document.getElementById('shareToast')
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    await navigator.clipboard.writeText(copyText.value);

    const toastShare = new bootstrap.Toast(shareToast)
    toastShare.show()
})

getFolders()
getFiles()
getNavigationOfFolders()
cal()