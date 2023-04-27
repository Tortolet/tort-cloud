const timerInstance = new easytimer.Timer();

if(parseInt(localStorage.getItem("count")) > 1){
    var onloadCallback = function() {
        grecaptcha.render('captcha', {
            'sitekey' : '6LcglfckAAAAAHvJOK67vquv4UBCQFxMHUC3c-v-',
            'theme' : 'dark'
        });
    };
}

function sumUser(){
    if (grecaptcha.getResponse().length === 0) {
        alert('Необходимо пройти капчу! Подождите 10 секунд после нажатия "OK"');
        $('#butSum').prop('disabled', true)
        timerInstance.start({countdown: true, startValues: {seconds: 10}});
        $('#time').html('Повторите попытку через: ' + timerInstance.getTimeValues().seconds.toString() + ' секунд');
        timerInstance.addEventListener("secondsUpdated", function (e) {
            $("#time").html('Повторите попытку через: ' + timerInstance.getTimeValues().seconds.toString() + ' секунд');
        });
        return false;
    }
    return true;
}

if(parseInt(localStorage.getItem("count")) > 2) {
    timerInstance.start({countdown: true, startValues: {seconds: 10}});
    $('#time').html('Повторите попытку через: ' + timerInstance.getTimeValues().seconds.toString() + ' секунд');
    timerInstance.addEventListener("secondsUpdated", function (e) {
        $('#butSum').prop('disabled', true)
        $("#time").html('Повторите попытку через: ' + timerInstance.getTimeValues().seconds.toString() + ' секунд');
    });
}

timerInstance.addEventListener('targetAchieved', function (e) {
    $('#butSum').prop('disabled', false)
    $("#time").html('');
});

function incrCount(){
    let value = localStorage.getItem("count");
    value++;
    localStorage.setItem("count", value);
    let test = localStorage.getItem("count");
    console.log(test);
}

function checkPassword() {
    const x = document.getElementById("floatingPassword");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }

}