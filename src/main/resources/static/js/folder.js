if(localStorage.getItem("pinnedFolder") === "true"){
    const toastLive = document.getElementById('liveToast')
    const toast = new bootstrap.Toast(toastLive)
    toast.show()
}

if(localStorage.getItem("pinnedFolder") === "false"){
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

async function cal(){
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

function getFolders() {
    const uuid = getPathVariableUuid();
    fetch('http://localhost:8080/api/get_folders_uuid/' + uuid)
        .then(response => {
            if(!response.ok) {
                return response.text().then(text => {throw Error(text)})
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            const folderContent = document.getElementById('folderContent')
            const folderCount = document.getElementById('foldersCount')
            folderCount.textContent += ` (${data.length})`
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let date = data[i].dateCreated.slice(0, 10)
                    let day = date.slice(8, 10)
                    let month = date.slice(5, 7)
                    let year = date.slice(0, 4)
                    if(data[i].bookmark === false) {
                        folderContent.innerHTML +=
                            `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a>  <ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item pin-folder" href="#" id="${data[i].uuid}">Закрепить</a></li>
                                            <li><a class="dropdown-item edit-folder" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item" href="#">Выбрать</a></li>
                                            <li><a class="dropdown-item" href="#">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-folder fa-solid"></i></div><a href="/main/${data[i].uuid}" style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5">${data[i].name}</p><small><span id="size-${data[i].uuid}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
                                    </div>
                                </div>`
                    }
                    if(data[i].bookmark === true) {
                        folderContent.innerHTML +=
                            `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a>  <ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button" href="#">Загрузить</a></li>
                                            <li><a class="dropdown-item unpin-folder" href="#" id="${data[i].uuid}">Открепить</a></li>
                                            <li><a class="dropdown-item edit-folder" href="#" data-bs-toggle="modal" data-bs-target="#editFolderName">Редактировать</a></li>
                                            <li><a class="dropdown-item" href="#">Выбрать</a></li>
                                            <li><a class="dropdown-item" href="#">Поделиться</a></li>
                                            <li><a class="dropdown-item info-folder" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                            <li><a class="dropdown-item text-danger delete-folder" href="#" data-bs-toggle="modal" data-bs-target="#deleteFolderModal">Удалить</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-folder fa-solid"></i></div><a href="/main/${data[i].uuid}" style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5">${data[i].name} <span><i class="fas fa-solid fa-star" style="color: #00bfff;"></i></span></p><small><span id="size-${data[i].uuid}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
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
                }

                const unpinButton = document.querySelectorAll('.unpin-folder')
                const pinButton = document.querySelectorAll('.pin-folder')
                const downloadButton = document.querySelectorAll('.download-button')
                const editButton = document.querySelectorAll('.edit-folder')
                const infoButton = document.querySelectorAll('.info-folder')
                const deleteButton = document.querySelectorAll('.delete-folder')
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

                        if(infoPin) {
                            infoPin = 'Да'
                            infoBookmarkFolderTrueFalse.classList.remove('text-danger')
                            infoBookmarkFolderTrueFalse.classList.add('text-success')
                        }
                        if(!infoPin) {
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

            }
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
}

function getPathVariableUuid() {
    const res = window.location.pathname;
    return res.slice(6, res.length)
}

if (window.innerWidth < 768) {
    const test = document.getElementById('sidebar');
    test.classList.remove('border-end');
}

window.addEventListener('resize', function(event) {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 768) {
        sidebar.classList.remove('border-end');
    }

    if (window.innerWidth >= 768) {
        sidebar.classList.add('border-end');
    }
});

getFolders()
cal()