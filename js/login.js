import { fetchJson, HttpResponse, postFormAsJson } from "./fetch.js";
import { displayViolations, clearViolations, setGlobalAlert, clearGlobalAlert } from "./form.js";

/**
 * @param {SubmitEvent} event 
 */
async function login(event) {
    event.preventDefault();
    let form = event.currentTarget;
    let url = form.action;

    clearViolations(["username", "password"], form);
    clearGlobalAlert(form);

    let formData = new FormData(form);
    //console.log(formData);
    let resp = await postFormAsJson(url, formData);
    let status = resp.status;
    let jsonResp = await resp.json();
    console.log(jsonResp);
    switch (status) {
        case HttpResponse.Ok:
            localStorage.setItem("token", jsonResp.tokenType + " " + jsonResp.token);
            document.location.replace("cabinet.html");
            break;
        case HttpResponse.BadRequest:
            // console.log(jsonResp.violations);
            await displayViolations(jsonResp.violations, form);
            break;
        case HttpResponse.Unauthorised:
            await setGlobalAlert(form, jsonResp.message);
            break;
    }
    //  console.log(await resp.json());

}

async function main() {
    console.log("script loaded")
    document.getElementById("login-form").addEventListener("submit", login);
}

document.addEventListener("DOMContentLoaded", main);
