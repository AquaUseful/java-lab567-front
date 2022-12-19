import { HttpMethod, fetchJson } from "./fetch.js";

export async function fetchAllUsers() {
    let resp = await fetchJson(HttpMethod.GET, "api/user", null, localStorage.getItem("token"));
    let respJson = await resp.json();
    return respJson;
}

export async function fetchSelf() {
    let resp = await fetchJson(HttpMethod.GET, "api/user/self", null, localStorage.getItem("token"));
    let user = await resp.json();
    return user;
}