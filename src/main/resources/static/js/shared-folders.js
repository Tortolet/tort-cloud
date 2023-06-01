const URL = 'http://localhost:8080/'

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

const uuid = getPathVariableUuid();
fetch('http://localhost:8080/api/get_folders_uuid_shared/' + uuid)
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
                    folderContent.innerHTML +=
                        `<div class="col-sm-12 col-md-4 col-lg-3">
                                    <div class="card border">
                                        <div class="file"><a><div class="hover"><div class="dropdown dropstart"><a class="btn btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><svg class="bi bi-gear" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewbox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"></path><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"></path></svg></a>  <ul class="dropdown-menu">
                                            <li><a class="dropdown-item download-button">Загрузить</a></li>
                                            <li><a class="dropdown-item info-folder" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-folder fa-solid"></i></div><a href="/shared-folders/${data[i].uuid}" style="color: inherit; text-decoration: none;"><div class="file-name border-top"><p class="m-b-5">${data[i].name}</p><small><span id="size-${data[i].uuid}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
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

            const downloadButton = document.querySelectorAll('.download-button')
            const infoButton = document.querySelectorAll('.info-folder')

            for (let j = 0; j < data.length; j++) {
                downloadButton[j]?.addEventListener("click", function () {
                    download(data[j].uuid, data[j].name)
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

        }
        folderCount.textContent += ` (${count})`
    })
    .catch(response => {
        window.location = URL + '404'
    })

fetch('http://localhost:8080/api/get_files_shared/' + uuid)
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
                                            <li><a class="dropdown-item download-button-file" href="javascript:void(0);" onclick="downloadFile(${data[i].id}, '${data[i].location}')">Загрузить</a></li>
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
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
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
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
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
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
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
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
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
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
                                            <li><a class="dropdown-item info-folder-file" href="#" data-bs-toggle="modal" data-bs-target="#infoFolderModal">Информация</a></li>
                                        </ul></div></div><div class="icon"><i class="fas fa-solid fa-file"></i></div><a href="#" style="color: inherit; text-decoration: none;" onclick="viewFile(${data[i].id}, '${data[i].location}')"><div class="file-name border-top"><p class="m-b-5 text-truncate">${data[i].location}</p><small><span id="size-${data[i].id}">Размер: </span><span class="text-muted date">${day}.${month}.${year}</span></small></div></a></a></div>
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
            const infoButton = document.querySelectorAll('.info-folder-file')
            for (let j = 0; j < data.length; j++) {
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
        }
    })

function getPathVariableUuid() {
    const res = window.location.pathname;
    return res.slice(16, res.length)
}

const downloadMainButton = document.getElementById('download-main')
downloadMainButton.addEventListener('click', function () {
    fetch('http://localhost:8080/api/get_folder_uuid/' + uuid)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.json();
        })
        .then(data => {
            download(data.uuid, data.name)
        })
        .catch(response => {
            window.location = URL + '404'
        })
}, true)