import { fetchJson, HttpMethod, HttpResponse, postFormMultipart, postFormAsJson } from "./fetch.js";
import { fetchAllUsers, fetchSelf } from "./user.js"
import { clearViolations, setGlobalAlert, clearGlobalAlert, displayViolations, clearFields } from "./form.js"

async function updateTime() {
    let timeResp = await fetchJson(HttpMethod.GET, "api/time", null, null);
    let timeJson = await timeResp.json();
    let dateObj = new Date(timeJson.time * 1000);
    let timeStr = dateObj.toLocaleString("ru-RU", { timeZoneName: "short" });
    console.log(timeStr);
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
            await displayAllUsers();
            await clearFields(form, ["username", "email", "password"]);
            break
        case HttpResponse.BadRequest:
            // console.log(jsonResp.violations);
            await displayViolations(jsonResp.violations, form);
            break;
    }
    //  console.log(await resp.json());
}

async function uploadApplication(event) {
    event.preventDefault();
    let form = event.currentTarget;
    let url = form.action;

    clearViolations(["doctorName", "service", "attachment"], form);
    clearGlobalAlert(form);

    let formData = new FormData(form);
    console.log(formData);
    let resp = await postFormMultipart(url, formData, localStorage.getItem("token"));
    let status = resp.status;
    let jsonResp = await resp.json();
    console.log(jsonResp);
    switch (status) {
        case HttpResponse.Ok:
            await setGlobalAlert(form, jsonResp.message);
            break;
        case HttpResponse.Created:
            await clearFields(form, ["doctorName", "service", "attachment"]);
            break
        case HttpResponse.BadRequest:
            // console.log(jsonResp.violations);
            await displayViolations(jsonResp.violations, form);
            break;
    }
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

    /* reader.addEventListener("loadend", async () => {
         
     })
     reader.readAsBinaryString(file);*/
}

async function generateUserCard(user) {
    let userId = user.id; //4 поскольку я уже добавил троих челиков как пример

    //типа данные из бд
    let name_ = user.username;
    let password_ = user.password;
    let email_ = user.email;
    let role_ = user.roles[0];

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
    return userCard;
}

async function displayAllUsers() {
    let allUsers = await fetchAllUsers();
    let container = document.getElementById("user-container")
    console.log(allUsers);

    container.innerHTML = "";
    for (let user of allUsers) {
        let card = await generateUserCard(user);
        container.append(card);
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

    let userSelf = await fetchSelf();
    if (userSelf.roles.includes("ADMIN")) {
        document.getElementById("admin-add-user-form").addEventListener("submit", adminAddUser);
        await displayAllUsers();
    }

}

document.addEventListener("DOMContentLoaded", main);