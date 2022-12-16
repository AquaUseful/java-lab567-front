import { fetchJson, HttpMethod, HttpResponse, postFormMultipart } from "./fetch.js";

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
    let userResp = await fetchJson(HttpMethod.GET, "api/user", null, token);
    let userJson = await userResp.json();
    //console.log((await userResp).json());
    document.getElementById("visits-count").innerHTML = userJson.loginCount;
    document.getElementById("user-name").innerHTML = userJson.username;
    await updateTime();
    setInterval(updateTime, 1000);

    let avatarResp = await fetchJson(HttpMethod.GET, "api/user/file", null, token);
    if (avatarResp.status == HttpResponse.Ok) {
        let blob = await avatarResp.blob()
        let localUrl = URL.createObjectURL(blob);
        console.log(localUrl);
        document.getElementById("avatar").src = localUrl;
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
    let resp = await fetch("api/user/file", {
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

async function main() {
    document.getElementById("upload-avatar").addEventListener("click", uploadAvatar);
    let token = localStorage.getItem("token");
    if (token == null) {
        document.location.replace("login.html");
    } else {
        loadData();
    }
}

document.addEventListener("DOMContentLoaded", main);