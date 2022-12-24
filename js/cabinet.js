import { fetchJson, HttpMethod, HttpResponse, postFormMultipart, postFormAsJson, sendFormAsJson, sendFormMultipart } from "./fetch.js";
import { fetchAllUsers, fetchSelf } from "./user.js"
import { clearViolations, setGlobalAlert, clearGlobalAlert, displayViolations, clearFields } from "./form.js"
import { displayAdminButtons, displayEditorButtons, displayUserButtons } from "./cabinet2.js";
import { fetchAllApplications } from "./application.js";
import { fetchAllNews } from "./news.js"

let userSelf;

async function updateTime() {
    let timeResp = await fetchJson(HttpMethod.GET, "api/time", null, null);
    let timeJson = await timeResp.json();
    let dateObj = new Date(timeJson.time * 1000);
    let timeStr = dateObj.toLocaleString("ru-RU", { timeZoneName: "short" });
    document.getElementById("current-time").innerHTML = timeStr;
}

async function loadData() {
    let token = localStorage.getItem("token");
    let userResp = await fetchJson(HttpMethod.GET, "api/user/self", null, token);
    let userJson = await userResp.json();
    //console.log((await userResp).json());
    document.getElementById("visits-count").innerHTML = userJson.loginCount;
    document.getElementById("user-name").innerHTML = userJson.username;
    await updateTime();
    setInterval(updateTime, 1000);

    let avatarResp = await fetchJson(HttpMethod.GET, "api/user/self/file", null, token);
    if (avatarResp.status == HttpResponse.Ok) {
        let blob = await avatarResp.blob()
        let localUrl = URL.createObjectURL(blob);
        console.log(localUrl);
        document.getElementById("avatar").src = localUrl;
    }
}

async function adminAddUser(event) {
    event.preventDefault();
    let form = event.currentTarget;
    let url = form.action;

    clearViolations(["username", "email", "password"], form);
    clearGlobalAlert(form);

    let formData = new FormData(form);
    console.log(formData);
    let resp = await postFormAsJson(url, formData, localStorage.getItem("token"));
    let status = resp.status;
    let jsonResp = await resp.json();
    console.log(jsonResp);
    switch (status) {
        case HttpResponse.Ok:
            await setGlobalAlert(form, jsonResp.message);
            break;
        case HttpResponse.Created:
            await displayAllUsers(userSelf.username);
            await clearFields(form, ["username", "email", "password"]);
            break
        case HttpResponse.BadRequest:
            // console.log(jsonResp.violations);
            await displayViolations(jsonResp.violations, form);
            break;
    }
    //  console.log(await resp.json());
}

async function uploadAvatar(event) {
    let token = localStorage.getItem("token");
    console.log("Updaload avatar")
    event.preventDefault();
    let input = document.getElementById("avatar-file");
    let file = input.files[0];
    let reader = new FileReader();
    let formData = new FormData();
    formData.append("file", file);
    let resp = await fetch("api/user/self/file", {
        method: HttpMethod.POST,
        body: formData,
        file: reader.result,
        headers: {
            "Authorization": token
        }
    });
    if (resp.status === HttpResponse.Created) {
        document.location.reload();
    }
}

/**
 * @param {Event} event 
 */
async function deleteUser(event) {
    event.preventDefault();
    let form = event.currentTarget;
    let url = form.action;

    let formData = new FormData(form);
    console.log(formData);
    let resp = await sendFormAsJson(url, formData, localStorage.getItem("token"), HttpMethod.DELETE);
    let status = resp.status;
    switch (status) {
        case HttpResponse.NoContent:
            await displayAllUsers(userSelf.username);
            break;
    }
}

async function generateUserCard(user, hasDeleteButton = true) {
    let userId = user.id; //4 поскольку я уже добавил троих челиков как пример

    //типа данные из бд
    let name_ = user.username;
    let password_ = user.password;
    let email_ = user.email;
    let role_ = user.role;

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
                data-bs-target="#adminUserEditModal${userId}" data-bs-toggle="modal"
                id="admin-button-user-edit${userId}">Редактировать</button>
        </div>
        <div class="col admin-button">
        <form action="api/user/${userId}" id="admin-delete-form${userId}">
            <button type="button " class="btn btn-danger ${((hasDeleteButton) ? "enabled" : "disabled")}"
                id="admin-button-user-delete${userId}">Удалить</button>
        </form>
        </div>
    </div>
</div>`
    return userCard;
}

async function generateUserModal(user, editSelf = false) {
    let userModalHtml = `<div class="modal-dialog modal-fullscreen">
        <div class="modal-content">
            <div class="modal-header">
                <!-- хз тут можно отображать его name - Редактировать пользователя Тактахыч -->
                <h5 class="modal-title" id="exampleModalLabel">Редактировать пользователя ${user.username}</h5>
            </div>
            <div class="modal-body">
                <div class="container-xxl modal-container">

                    <form class="user-edit-form" id="admin-edit-user-form${user.id}" action="/api/user/${user.username}">
                        <div class="mb-3" id="usernameEdit">
                            <div class="input-group has-validation">
                                <div class="form-floating" id="usernameContainer">
                                    <input id="usernameGroup" name="username" type="text"
                                        class="form-control" required value="${user.username}" ${(editSelf ? "disabled" : "")}>
                                    <label for="usernameGroup">Редактировать имя пользователя</label>
                                </div>
                                <div class="invalid-feedback" id="usernameMessage">
                                </div>
                            </div>
                        </div>

                        <!-- Форма для ввода email -->
                        <div class="mb-3" id="emailEdit">
                            <div class="input-group has-validation">
                                <div class="form-floating" id="emailContainer">
                                    <input id="emailGroup" name="email" type="email"
                                        class="form-control" required value="${user.email}">
                                    <label for="emailGroup">Редактировать Email</label>
                                </div>
                                <div class="invalid-feedback" id="emailMessage">
                                </div>
                            </div>
                        </div>
                        <!-- Форма для ввода пароля -->
                        <div class="mb-3" id="passwordEdit">
                            <div class="input-group has-validation">
                                <div class="form-floating" id="passwordContainer">
                                    <input id="passwordGroup" name="password" type="text"
                                        class="form-control" required value="${user.password}">
                                    <label for="passwordGroup">Редактировать пароль</label>
                                </div>
                                <div class="invalid-feedback" id="passwordMessage">
                                </div>
                            </div>
                        </div>
                        ${(!editSelf ?
            `<fieldset class="form-group">
                            <div class="row">
                                <legend class="col-form-label col-sm-2 pt-0">Роль</legend>
                                <div class="col-sm-10">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="role"
                                            id="roleRadio1" value="USER" ${(user.role === "USER" ? "checked" : "")}>
                                        <label class="form-check-label" for="gridRadios1">
                                            USER
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="role"
                                            id="roleRadio2" value="EDITOR"  ${(user.role === "EDITOR" ? "checked" : "")}>
                                        <label class="form-check-label" for="gridRadios2">
                                            EDITOR
                                        </label>
                                    </div>
                                    <div class="form-check disabled">
                                        <input class="form-check-input" type="radio" name="role"
                                            id="roleRadio3" value="ADMIN"  ${(user.role === "ADMIN" ? "checked" : "")}>
                                        <label class="form-check-label" for="gridRadios3">
                                            ADMIN
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </fieldset>`
            : "")
        }
                        <div id="globAlert" class="alert alert-danger d-none" role="alert"></div>
                        <button type="submit" class="btn btn-primary"
                            id="admin-button-user-edit">Сохранить</button>
                    </form>
                  <!--  <div class="container-xxl">
                        <div>Заявки пользователя</div>
                        <div class="card user-card user-req">
                            <div class="card-body user-card-body">
                                <div class="container text-center">
                                    <div class="row">
                                        <div class="col">
                                            <p>Фио: </p>
                                            <p id="doc-name2">Темирболатов Шамиль Расулович</p>
                                        </div>
                                        <div class="col">
                                            <p>Услуга</p>
                                            <p id="service-name2">Лечение плоскостопия</p>
                                        </div>
                                        <div class="col">
                                            <p>Файл: </p>
                                            <a href="#">Рентген.jpg</a>
                                        </div>
                                        <div class="col">
                                            <button type="button" class="btn btn-danger">Удалить
                                                заявку</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> -->
                </div>
            </div>
            <div class="modal-footer">
                <a class="btn btn-secondary" data-bs-toggle="modal" href="#adminModal"
                    role="button">Вернуться к
                    списку пользователей</a>
            </div>
        </div>
    </div>`;
    let adminEditUserModal = document.createElement("div");
    adminEditUserModal.className = "modal fade";
    adminEditUserModal.id = `adminUserEditModal${user.id}`;
    adminEditUserModal.tabIndex = -1;
    adminEditUserModal.ariaHidden = true;
    adminEditUserModal.innerHTML = userModalHtml;
    return adminEditUserModal
}

async function createEditUserHandler(editModal, listUserModal) {
    return async (event) => {
        event.preventDefault();

        let form = event.currentTarget;
        let url = form.action;

        clearViolations(["username", "email", "password"], form);
        clearGlobalAlert(form);

        let formData = new FormData(form);
        console.log(formData);
        let resp = await sendFormAsJson(url, formData, localStorage.getItem("token"), HttpMethod.PATCH);
        switch (resp.status) {
            case HttpResponse.NoContent:
                bootstrap.Modal.getInstance(editModal).hide();
                bootstrap.Modal.getInstance(listUserModal).show();
                await displayAllUsers(userSelf.username);
                break
            case HttpResponse.BadRequest:
                let jsonResp = await resp.json();
                await displayViolations(jsonResp.violations, form);
                break;
        }
    };
}

async function displayAllUsers(skipName) {
    let allUsers = await fetchAllUsers();
    let container = document.getElementById("user-container")
    let modalContainer = document.getElementById("adminUserEditModalContainer");
    container.innerHTML = "";
    modalContainer.innerHTML = "";
    for (let user of allUsers) {
        let card = await generateUserCard(user, user.username !== skipName);
        let modal = await generateUserModal(user, user.username === skipName);
        container.appendChild(card);
        modalContainer.appendChild(modal);
        if (user.username !== skipName) {
            document.getElementById(`admin-delete-form${user.id}`).addEventListener("submit", deleteUser);
        }
        document.getElementById(`admin-edit-user-form${user.id}`)
            .addEventListener("submit", await createEditUserHandler(modal, document.getElementById("adminModal")));
    }
}

async function generateApplicationCard(application) {
    let applHtml = `<div class="card-body user-card-body">
            <!-- динамическая генерация номера -->
            <h5 class="card-title">Заявка ${application.id}</h5>
            <div class="container text-center">
                <div class="row">
                    <div class="col login-col">
                        <p class="card-text card-text-admin">ФИО Доктора</p>
                        <p class="card-text card-login" id="#requestDocName1">${application.doctorName}</p>
                    </div>
                    <div class="col password-col">
                        <p class="card-text card-text-admin">Услуга</p>
                        <p class="card-text card-password" id="#requestService1">${application.service}</p>
                    </div>
                    ${((application.attachment != null) ? `<div class="col role-cole">
                    <p class="card-text card-text-admin">Файл</p>
                    <a href="api/file/${application.attachment.id}">Скачать</a>
                </div>` : "")}
                    <div class="col admin-button">
                        <button type="button " class="btn btn-primary"
                            data-bs-target="#applicationEditModal${application.id}" data-bs-toggle="modal"
                            id="admin-button-user-edit">Редактировать</button>
                    </div>
                    <div class="col admin-button">
                    <form action="api/user/self/application/${application.id}" id="applicationDeleteForm${application.id}">
                        <button type="button " class="btn btn-danger"
                            id="applicationDeleteButton${application.id}">Удалить</button>
                    </form>
                    </div>
                </div >
            </div >
        </div>`;
    let card = document.createElement("div");
    card.className = "card user-card";
    card.id = `applicationCard${application.id}`;
    card.innerHTML = applHtml;
    return card;
}

async function generateApplicationModal(application) {
    let appModalHtml = `<div class="modal-dialog modal-fullscreen">
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Редактировать заявку</h5>
        </div>
        <div class="modal-body">
            <div class="container-xxl modal-container">
                <form class="user-edit-form" id="requestEditForm${application.id}" action="api/user/self/application/${application.id}">
                    <div class="mb-3">
                        <div class="input-group has-validation">
                            <div class="form-floating" id="doctorNameContainer">
                                <input id="doctorNameGroup" name="doctorName" type="text"
                                    class="form-control" required value="${application.doctorName}">
                                    <label for="doctorNameGroup">ФИО врача: </label>
                            </div>
                            <div class="invalid-feedback" id="doctorNameMessage">
                            </div>
                        </div>
                    </div>

                    <div class="mb-3" id="serviceEdit">
                        <div class="input-group has-validation">
                            <div class="form-floating" id="serviceContainer">
                                <input id="serviceGroup" name="service" type="text" class="form-control"
                                    required value="${application.service}">
                                    <label for="serviceEditGroup">Наименование услуги: </label>
                            </div>
                            <div class="invalid-feedback" id="serviceMessage">
                            </div>
                        </div>
                    </div>

                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" name="deleteAttachment" id="deleteAttachmentCheck">
                            <label class="form-check-label" for="exampleCheck1" for="deleteAttachmentCheck">Удалить прилагаемый файл</label>
                    </div>

                    <div class="mb-3" id="requestAttachment">
                        <div class="form-group form-group-info service-file">
                            <label for="request-send-file" class="col-form-label">Новый файл (заменяет старый, если не выбрана опция удалить файл)</label>
                            <input name="attachment" type="file" class="form-control-file" id="request-send-file">
                        </div>
                    </div>
                    <div id="globAlert" class="alert alert-danger d-none" role="alert"></div>

                    <button type="submit" class="btn btn-primary">Сохранить</button>
                </form>
            </div>
        </div>
        <div class="modal-footer">
            <a class="btn btn-secondary" data-bs-toggle="modal" href="#userRequestModal"
                role="button">Вернуться к
                списку заявок</a>
        </div>
    </div>
    </div>`;
    let modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = `applicationEditModal${application.id}`;
    modal.innerHTML = appModalHtml;
    return modal;
}

async function createEditApplicationHandler(editModal, listModal) {
    return async (event) => {
        event.preventDefault();

        let form = event.currentTarget;
        let url = form.action;

        clearViolations(["doctorName", "service"], form);
        clearGlobalAlert(form);

        let formData = new FormData(form);
        console.log(formData);
        let resp = await sendFormMultipart(url, formData, localStorage.getItem("token"), HttpMethod.PATCH);
        switch (resp.status) {
            case HttpResponse.NoContent:
                bootstrap.Modal.getInstance(editModal).hide();
                bootstrap.Modal.getInstance(listModal).show();
                await displayAllApplications(userSelf.username);
                break
            case HttpResponse.BadRequest:
                let jsonResp = await resp.json();
                await displayViolations(jsonResp.violations, form);
                break;
        }
    };
}

async function deleteApplication(event) {
    event.preventDefault();
    let form = event.currentTarget;
    let url = form.action;

    let formData = new FormData(form);
    console.log(formData);
    let resp = await sendFormAsJson(url, formData, localStorage.getItem("token"), HttpMethod.DELETE);
    let status = resp.status;
    switch (status) {
        case HttpResponse.NoContent:
            await displayAllApplications(userSelf.username);
            break;
    }
}

async function displayAllApplications() {
    let allApplications = await fetchAllApplications();
    let container = document.getElementById("application-container")
    let modalContainer = document.getElementById("applicationEditModalContainer");
    container.innerHTML = "";
    modalContainer.innerHTML = "";
    for (let application of allApplications) {
        let card = await generateApplicationCard(application);
        let modal = await generateApplicationModal(application);
        container.appendChild(card);
        modalContainer.appendChild(modal);
        document.getElementById(`applicationDeleteForm${application.id}`).addEventListener("submit", deleteApplication);
        document.getElementById(`requestEditForm${application.id}`)
            .addEventListener("submit", await createEditApplicationHandler(modal, document.getElementById("userRequestModal")));
    }
}

async function uploadApplication(event) {
    event.preventDefault();
    let form = event.currentTarget;
    let url = form.action;

    clearViolations(["doctorName", "service"], form);
    clearGlobalAlert(form);

    let formData = new FormData(form);
    console.log(formData);
    let resp = await postFormMultipart(url, formData, localStorage.getItem("token"));
    switch (resp.status) {
        case HttpResponse.Ok:
            await setGlobalAlert(form, (await resp.json()).message);
            break;
        case HttpResponse.Created:
            await clearFields(form, ["doctorName", "service", "attachment"]);
            await displayAllApplications();
            bootstrap.Modal.getInstance(document.getElementById("userModal")).hide();
            bootstrap.Modal.getInstance(document.getElementById("userRequestModal")).show();
            break
        case HttpResponse.BadRequest:
            // console.log(jsonResp.violations);
            await displayViolations((await resp.json()).violations, form);
            break;
    }
}

async function generateNewsCard(news) {
    let cardHtml = `<div class="card-body user-card-body">
    <h5 class="card-title">Новость ${news.id}</h5>
    <div class="container news-container text-center">
        <div class="row news-row">
            <div class="col-2 newsheading-col">
                <p class="card-text card-text-newsheading fw-bold">Заголовок</p>
                <p class="card-text card-newsheading" id="#card-newsheading1">${news.title}</p>
            </div>

            <div class="col-2 newsheading-col">
                <p class="card-text card-text-newsheading fw-bold">Содержание</p>
                <p class="card-text card-newsheading" id="#card-newsheading1">${news.content}</p>
            </div>

            ${((news.picture != null) ?
            `<div class="col-2 newsheading-col">
                <p class="card-text card-text-newsheading fw-bold">Изображение</p>
                <img src="api/file/${news.picture.id}" width="200"></img>
            </div>`
            : "")}

            <div class="col-2 admin-button">
                <button type="button " class="btn btn-primary"
                    data-bs-target="#editorEditNewsModal${news.id}"
                    data-bs-toggle="modal">Редактировать</button>
            </div>
            <div class="col-2 admin-button">
            <form action="api/news/${news.id}" id="newsDeleteForm${news.id}">
                <button type="button " class="btn btn-danger"
                    id="newsDeleteButton${news.id}">Удалить</button>
            </form>
            </div>
        </div>
    </div>
</div>`
    let card = document.createElement("div");
    card.className = "card user-card";
    card.innerHTML = cardHtml;
    return card;
}

async function generateNewsModal(news) {
    let modalHtml = `< div class="modal-dialog modal-fullscreen" >
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Редактировать новость</h5>
        </div>
        <div class="modal-body">
            <div class="container-xxl modal-container">
                <form class="user-edit-form" id="newsEditForm${news.id}" action="api/news/${news.id}">
                    <!-- Форма для ввода названия -->
                    <div class="mb-3" id="title">
                        <div class="input-group has-validation">
                            <div class="form-floating" id="emailContainer">
                                <input id="titleGroup" name="title" type="text" class="form-control"
                                    required value="${news.title}">
                                    <label for="titleGroup">Название новости</label>
                            </div>
                            <div class="invalid-feedback" id="titleMessage">
                            </div>
                        </div>
                    </div>
                    <!-- Форма для ввода содержания -->
                    <div class="mb-3" id="content">
                        <div class="input-group has-validation">
                            <div class="form-floating" id="contentContainer">
                                <textarea id="contentGroup" name="content" rows="10" class="form-control"
                                    required>${news.content}</textarea>
                                <label for="contentGroup">Содержание новости</label>
                            </div>
                            <div class="invalid-feedback" id="contentMessage">
                            </div>
                        </div>
                    </div>

                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" name="deletePicture"
                            id="deletePictureCheck">
                            <label class="form-check-label" for="exampleCheck1"
                                for="deletePictureCheck">Удалить изображение</label>
                    </div>

                    <div class="mb-3" id="newsPicture">
                        <div class="form-group form-group-info service-file">
                            <label for="request-send-file" class="col-form-label">Новое изображение файл
                                (заменяет старое, если не выбрана опция удалить изображение)</label>
                            <input name="picture" type="file" class="form-control-file">
                        </div>
                    </div>

                    <div id="globAlert" class="alert alert-danger d-none" role="alert"></div>

                    <button type="submit" class="btn btn-primary"
                        id="admin-button-user-add">Сохранить</button>
                </form>
            </div>
            <div class="modal-footer">
                <a class="btn btn-secondary" data-bs-toggle="modal" href="#editorModal"
                    role="button">Вернуться
                    к
                    списку новостей</a>
            </div>
        </div>
    </div>
    </div > `;
    let modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = `editorEditNewsModal${news.id}`;
    modal.innerHTML = modalHtml;
    return modal;
}

async function deleteNews(event) {
    event.preventDefault();
    let form = event.currentTarget;
    let url = form.action;

    let formData = new FormData(form);
    console.log(formData);
    let resp = await sendFormAsJson(url, formData, localStorage.getItem("token"), HttpMethod.DELETE);
    let status = resp.status;
    switch (status) {
        case HttpResponse.NoContent:
            await displayAllNews(userSelf.username);
            break;
    }
}

async function createEditNewsHandler(editModal, listModal) {
    return async (event) => {
        event.preventDefault();

        let form = event.currentTarget;
        let url = form.action;

        clearViolations(["title", "content"], form);
        clearGlobalAlert(form);

        let formData = new FormData(form);
        console.log(formData);
        let resp = await sendFormMultipart(url, formData, localStorage.getItem("token"), HttpMethod.PATCH);
        switch (resp.status) {
            case HttpResponse.NoContent:
                bootstrap.Modal.getInstance(editModal).hide();
                bootstrap.Modal.getInstance(listModal).show();
                await displayAllNews();
                break
            case HttpResponse.BadRequest:
                let jsonResp = await resp.json();
                await displayViolations(jsonResp.violations, form);
                break;
        }
    };
}

async function displayAllNews() {
    let allNews = await fetchAllNews();
    let container = document.getElementById("newsContainer");
    let modalContainer = document.getElementById("newsEditModalContainer");
    container.innerHTML = "";
    modalContainer.innerHTML = "";
    for (let news of allNews) {
        let card = await generateNewsCard(news);
        let modal = await generateNewsModal(news);
        container.appendChild(card);
        modalContainer.appendChild(modal);
        document.getElementById(`newsDeleteForm${news.id}`).addEventListener("submit", deleteNews);
        document.getElementById(`newsEditForm${news.id}`)
            .addEventListener("submit", await createEditNewsHandler(modal, document.getElementById("editorModal")));
    }
}

async function uploadNews(event) {
    event.preventDefault();
    let form = event.currentTarget;
    let url = form.action;

    clearViolations(["title", "content"], form);
    clearGlobalAlert(form);

    let formData = new FormData(form);
    console.log(formData);
    let resp = await postFormMultipart(url, formData, localStorage.getItem("token"));
    switch (resp.status) {
        case HttpResponse.Ok:
            await setGlobalAlert(form, (await resp.json()).message);
            break;
        case HttpResponse.Created:
            await clearFields(form, ["title", "content"]);
            await displayAllNews();
            bootstrap.Modal.getInstance(document.getElementById("editorAddNewsModal")).hide();
            bootstrap.Modal.getInstance(document.getElementById("editorModal")).show();
            break
        case HttpResponse.BadRequest:
            // console.log(jsonResp.violations);
            await displayViolations((await resp.json()).violations, form);
            break;
    }
}

async function main() {
    document.getElementById("upload-avatar").addEventListener("click", uploadAvatar);
    let token = localStorage.getItem("token");
    if (token == null) {
        document.location.replace("login.html");
    } else {
        loadData();
    }

    userSelf = await fetchSelf();
    switch (userSelf.role) {
        case "ADMIN":
            document.getElementById("admin-add-user-form").addEventListener("submit", adminAddUser);
            await displayAllUsers(userSelf.username);
            await displayAdminButtons();
            break;
        case "USER":
            document.getElementById("applicationAddForm").addEventListener("submit", uploadApplication);
            await displayAllApplications();
            await displayUserButtons();
            break;
        case "EDITOR":
            document.getElementById("addNewsForm").addEventListener("submit", uploadNews);
            await displayAllNews();
            await displayEditorButtons();
            break;

    }
}

document.addEventListener("DOMContentLoaded", main);