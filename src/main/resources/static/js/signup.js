const URL = "http://localhost:8080";

function success() {
    document.getElementById('buttonSuccess').disabled = document.getElementById("floatingEmail").value === "" || document.getElementById("floatingUsername").value === "" || document.getElementById("floatingPassword").value === "" || document.getElementById("floatingPasswordConfirm").value === "" || document.getElementById("floatingEmail").classList.contains('border-danger') || document.getElementById("companySelector").value === "zero-select";
}

function showPassword() {
    const password = document.getElementById('floatingPassword')
    const confirmPassword = document.getElementById('floatingPasswordConfirm')
    if (password.type === "password") {
        password.type = "text";
        confirmPassword.type = "text"
    } else {
        password.type = "password";
        confirmPassword.type = "password";
    }
}

const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

const input = document.querySelector('#floatingEmail');

const emailVal = document.querySelector('#emailValidation');

function onInput() {
    if (isEmailValid(input.value)) {
        input.classList.remove("border-danger");
        input.classList.add('border-success');
        emailVal.innerHTML = `<p class="text-start text-success" style="font-size: 80%">Почта написана верно</p>`;
    } else {
        input.classList.remove("border-success");
        input.classList.add('border-danger');
        emailVal.innerHTML = `<p class="text-start text-danger" style="font-size: 80%">Некорректная почта</p>`;
    }
}

input.addEventListener('input', onInput);

function isEmailValid(value) {
    return EMAIL_REGEXP.test(value);
}

function addUser(){
    fetch('http://localhost:8080/api/registration', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'companyId': document.getElementById("companySelector").value
        },
        body: JSON.stringify(
            {
                "username": document.getElementById("floatingUsername").value,
                "password" : document.getElementById("floatingPassword").value,
                "passwordConfirm" : document.getElementById("floatingPasswordConfirm").value,
                "email" : document.getElementById("floatingEmail").value
            })
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw Error(text)})
            }
        })
        .then(data => {
            console.log(JSON.stringify(data))
            window.location.replace(URL + "/login");
        })
        .catch(response => {
            let test = JSON.parse(response.message);
            let error = document.getElementById("error");

            //alert(test.message);
            console.log(`Тест: ${test.message}`);
            error.innerHTML = `<div class="form-control alert alert-danger">${test.message}</div>`
        });
}