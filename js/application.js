import { HttpMethod, fetchJson } from "./fetch.js";

export async function fetchAllApplications() {
    let resp = await fetchJson(HttpMethod.GET, "api/user/self/application", null, localStorage.getItem("token"));
    let respJson = await resp.json();
    return respJson;
}
