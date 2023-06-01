const URL = 'http://localhost:8080/'

function seeFile() {
    const id = getPathVariableUuid();
    fetch('/api/get_shared_file?id=' + id)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text)
                })
            }
            return response.json()
        })
        .then(data => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/api/view?id=' + encodeURIComponent(id), true);

            xhr.responseType = 'blob';

            xhr.onload = function() {
                if (xhr.status === 200) {
                    const blob = xhr.response;
                    const url = (window.URL || window.webkitURL).createObjectURL(blob);
                    const contentType = xhr.getResponseHeader('Content-Type');
                    if (contentType !== 'application/octet-stream'){
                        const toNewPage = document.createElement('a');
                        toNewPage.addEventListener('click', function () {
                            toNewPage.href = url;
                        }, true)
                        toNewPage.click();
                    }
                    if (contentType === 'application/octet-stream'){
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = data.location;
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
        })
        .catch(response => {
            window.location = URL + '404'
        })
}


function getPathVariableUuid() {
    const res = window.location.pathname;
    return res.slice(14, res.length)
}

seeFile()