import { HttpMethod, fetchJson } from "./fetch.js";

export async function fetchAllNews() {
    let resp = await fetchJson(HttpMethod.GET, "api/news", null, localStorage.getItem("token"));
    let jsonResp = await resp.json();
    return jsonResp;
}
