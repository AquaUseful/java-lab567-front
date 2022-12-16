//авторизация разных ролей
const userCb = document.getElementById("test-user-role");
const adminCb = document.getElementById("test-admin-role");
const editorCb = document.getElementById("test-editor-role");

const adminPanelButton = document.getElementById("admin-panel-button");
const editorPanelButton = document.getElementById("editor-panel-button");
const userPanelButton = document.getElementById("user-panel-button");

//авторизовался микрочел без прав
userCb.onclick = function () {
    if (userCb.checked == true) {
        adminPanelButton.innerHTML = ``;
        editorPanelButton.innerHTML = ``;
        userPanelButton.innerHTML = `<button type="button" class="btn btn-primary app-button"
                                data-bs-toggle="modal" data-bs-target="#userModal">Записаться на приём</button>`;
    }
};

//авторизовался микрочел с правами админа
adminCb.onclick = function () {
    if (adminCb.checked == true) {
        adminPanelButton.innerHTML = `<button type="button" class="btn btn-danger admin-button"
        data-bs-toggle="modal" data-bs-target="#adminModal">Панель админа</button>`;
        editorPanelButton.innerHTML = ``;
        userPanelButton.innerHTML = ``;
    }
};

//авторизовался микрочел с правами едитора
editorCb.onclick = function () {
    if (editorCb.checked == true) {
        adminPanelButton.innerHTML = ``;
        editorPanelButton.innerHTML = `<button type="button" class="btn btn-success editor-button"
        data-bs-toggle="modal" data-bs-target="#editorModal">Панель редактора</button>`;
        userPanelButton.innerHTML = ``;
    }
};








//визуализация добавления карточки юзера в панель админа
//предположим челик регается либо же его создает админ в разделе "Добавить пользователя"
//соответственно данные попадают в бд

//мы взяли некоторые данные из бд
let userId = 4; //4 поскольку я уже добавил троих челиков как пример

//типа данные из бд
let name_ = "Какой-то мужик";
let password_ = "sdhASDVasdgbasd123";
let email_ = "aasdasdh@yad.ru";
let role_ = "admin";

const userContainer = document.getElementById("user-container");
const userCard = document.createElement("div");
userCard.className = "card user-card";
userCard.id = `user-card${userId}`
userCard.innerHTML =
    `<div class="card-body user-card-body">
<h5 class="card-title">Пользователь №${userId}</h5>
<div class="container text-center">
    <div class="row">
        <div class="col login-col">
            <p class="card-text card-text-admin">Имя пользователя</p>
            <p class="card-text card-login" id="#user-login${userId}">${name_}</p>
        </div>
        <div class="col password-col">
            <p class="card-text card-text-admin">Пароль</p>
            <p class="card-text card-password" id="#user-password${userId}">${password_}</p>

        </div>
        <div class="col email-col">
            <p class="card-text card-text-admin">Email</p>
            <p class="card-text card-email" id="#user-email${userId}">${email_}</p>
        </div>
        <div class="col role-cole">
            <p class="card-text card-text-admin">Роль</p>
            <p class="card-text card-role" id="#user-role${userId}">${role_}</p>
        </div>
        <div class="col admin-button">
            <button type="button " class="btn btn-primary"
                data-bs-target="#adminUserEditModal1" data-bs-toggle="modal"
                id="admin-button-user-edit${userId}">Редактировать</button>
        </div>
    </div>
</div>`

userContainer.append(userCard);
//типа появился 4 юзер

//таким же способом можно удалить карточку юзера из списка в панели
//или через userContainer.removeChild(userCard);


//полагаю, что таким же способом можно визуально добавлять и удалять заявки юзера в раздел "Редактировать пользователя"
//а также новости из раздела "Панель редактора" и комментарии из раздела "Редактировать новость"
//да и добавление новости на мейн странице я делал бы также






//запрет ввода в поля для редактирования юзера/новости
const loginInputCheck = document.getElementById("login-check");
const passwordInputCheck = document.getElementById("password-check");
const emailInputCheck = document.getElementById("email-check");
loginInputCheck.onclick = function () {
    if (loginInputCheck.checked == true) {
        document.getElementById('edit-login').readOnly = true;
    } else {
        document.getElementById('edit-login').readOnly = false;
    }
};

passwordInputCheck.onclick = function () {
    if (passwordInputCheck.checked == true) {
        document.getElementById('edit-password').readOnly = true;
    } else {
        document.getElementById('edit-password').readOnly = false;
    }
};

emailInputCheck.onclick = function () {
    if (emailInputCheck.checked == true) {
        document.getElementById('edit-email').readOnly = true;
    } else {
        document.getElementById('edit-email').readOnly = false;
    }
};





//ещё немного насраного текста и мыслей по поводу лабы
//У меня добавлено три юзера: редактор, обычный чел и админ.можно обойтись и без редактора, но тогда там надо будет чутка переделать интерфейсыч
//сайт, где я пиздил новости https://medsi.ru/about/press-centr/
//Лайки есть, комменты тоже, но никто не сказал, что комменты должны отображаться на мейн странице, поэтому они будут идти по каждой новости в редакт-меню и там хранится, ибо таташкин ебнулся