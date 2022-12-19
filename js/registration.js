import { fetchJson, HttpResponse, postFormAsJson } from "./fetch.js";
import { displayViolations, clearViolations, setGlobalAlert, clearGlobalAlert } from "./form.js";

/**
 * @param {SubmitEvent} event 
 */
async function register(event) {
    event.preventDefault();
    let form = event.currentTarget;
    let url = form.action;

    clearViolations(["username", "email", "password"], form);
    clearGlobalAlert(form);

    let formData = new FormData(form);
    //console.log(formData);
    let resp = await postFormAsJson(url, formData, "");
    let status = resp.status;
    let jsonResp = await resp.json();
    console.log(jsonResp);
    switch (status) {
        case HttpResponse.Ok:
            console.log("ok resp");
            await setGlobalAlert(form, jsonResp.message);
            break;
        case HttpResponse.Created:
            document.location.replace("login.html");
            break
        case HttpResponse.BadRequest:
            // console.log(jsonResp.violations);
            await displayViolations(jsonResp.violations, form);
            break;
    }
    //  console.log(await resp.json());

}

async function main() {
    console.log("script loaded")
    document.getElementById("registration-form").addEventListener("submit", register);
}

document.addEventListener("DOMContentLoaded", main);
