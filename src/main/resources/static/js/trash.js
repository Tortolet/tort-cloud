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

localStorage.removeItem("count");
localStorage.removeItem("pinnedFolder");

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

function updatePassword() {
    fetch('http://localhost:8080/api/update_user_password', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'oldPassword': document.getElementById('editingOldPass').value,
            'newPassword': document.getElementById('editingNewPass').value,
            'newPasswordConfirm': document.getElementById('editingNewPassConfirm').value
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
            'email': document.getElementById('editingMail').value
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
            'companyId': localStorage.getItem('company_id')
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


function deleteFolder(folderId) {
    fetch('http://localhost:8080/api/delete_folder', {
        method: 'DELETE',
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
            return response.text()
        })
        .then(data => {
            location.reload()
        })
        .catch(response => {
            console.log('Ошибка удаления папки')
        })
}

function returnFolder(folderId) {
    fetch('http://localhost:8080/api/return_folder', {
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
            console.log('Ошибка')
        })
}


function getFolders() {
    fetch('http://localhost:8080/api/get_folders_in_trash')
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
                    if (data[i].inTrash === true) {
                        let date = data[i].dateCreated.slice(0, 10)
                        let day = date.slice(8, 10)
                        let month = date.slice(5, 7)
                        let year = date.slice(0, 4)
                        folderContent.innerHTML +=
                            `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a>  <ul class="dropdown-menu">
                                            <li><a class="dropdown-item return-folder" href="#" id="${data[i].uuid}">Восстановить</a></li>
                                            <li><a class="dropdown-item info-folder" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-folder fa-solid"></i></div><a style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].name}</p><small><span id="size-${data[i].uuid}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
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

                const returnButton = document.querySelectorAll('.return-folder')
                const infoButton = document.querySelectorAll('.info-folder')
                const deleteButton = document.querySelectorAll('.delete-folder')
                let idModal;
                for (let j = 0; j < data.length; j++) {
                    returnButton[j]?.addEventListener("click", function () {
                        idModal = data[j].id;
                        returnFolder(idModal)
                    }, true);
                    deleteButton[j]?.addEventListener("click", function () {
                        idModal = data[j].id;
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

                const deleteFolderButton = document.getElementById('deleteFolderButton')
                deleteFolderButton.addEventListener('click', function () {
                    deleteFolder(idModal)
                }, true)

            }
            folderCount.textContent += ` (${count})`
        })
}

function getFiles() {
    fetch('http://localhost:8080/api/get_files_trash')
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
                    if (data[i].location.includes('.xls')) {
                        fileContent.innerHTML +=
                            `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="#" id="${data[i].id}">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item" href="#">Выбрать</a></li>
                                            <li><a class="dropdown-item" href="#">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-table" style="color: #158a3c;"></i></div><a style="color: inherit; text-decoration: none;"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                    }
                    if (data[i].location.includes('.png') || data[i].location.includes('.jpg') || data[i].location.includes('.heic')) {
                        fileContent.innerHTML +=
                            `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="#" id="${data[i].id}">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item" href="#">Выбрать</a></li>
                                            <li><a class="dropdown-item" href="#">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-image" style="color: #15328a;"></i></div><a style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                    }
                    if (data[i].location.includes('.mp4') || data[i].location.includes('.wav')) {
                        fileContent.innerHTML +=
                            `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="#" id="${data[i].id}">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item" href="#">Выбрать</a></li>
                                            <li><a class="dropdown-item" href="#">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-video" style="color: #8a1515;"></i></div><a style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                    }
                    if (data[i].location.includes('.mp3')) {
                        fileContent.innerHTML +=
                            `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="#" id="${data[i].id}">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item" href="#">Выбрать</a></li>
                                            <li><a class="dropdown-item" href="#">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-audio" style="color: #adcd0e;"></i></div><a style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                    }
                    if (data[i].location.includes('.java') || data[i].location.includes('.js') || data[i].location.includes('.html') || data[i].location.includes('.css') || data[i].location.includes('.py') || data[i].location.includes('.cs') || data[i].location.includes('.cpp')) {
                        fileContent.innerHTML +=
                            `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="#" id="${data[i].id}">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item" href="#">Выбрать</a></li>
                                            <li><a class="dropdown-item" href="#">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file-code" style="color: #158a7c;"></i></div><a style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                    }
                    if (!(data[i].location.includes('.java') || data[i].location.includes('.js') || data[i].location.includes('.html') || data[i].location.includes('.css') || data[i].location.includes('.py') || data[i].location.includes('.cs') || data[i].location.includes('.cpp') || data[i].location.includes('.mp3') || data[i].location.includes('.mp4') || data[i].location.includes('.wav') || data[i].location.includes('.png') || data[i].location.includes('.jpg') || data[i].location.includes('.heic') || data[i].location.includes('.xls'))) {
                        fileContent.innerHTML +=
                            `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a><ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button-file" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder-file" href="#" id="${data[i].id}">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item" href="#">Выбрать</a></li>
                                            <li><a class="dropdown-item" href="#">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file"></i></div><a style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
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
            }
        })
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

getFolders()
getFiles()
cal()