export const HttpMethod = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
    PATCH: "PATCH"
};

export const HttpResponse = {
    Ok: 200,
    Created: 201,
    BadRequest: 400,
    Forbidden: 403,
    Unauthorised: 401
}

/**
 * @param {string} type 
 * @param {string} url
 * @param {Object} obj
 */
export async function fetchJson(type, url, body, authToken = "") {
    let response = await fetch(
        url,
        {
            method: type,
            body: (type == HttpMethod.GET ? null : JSON.stringify(body)),
            headers: {
                "Content-Type": "application/json;charset=utf8",
                "Authorization": authToken
            }
        }
    );
    return response;
}

/**
 * @param {string} url 
 * @param {FormData} formData 
 */
export async function postFormAsJson(url, formData) {
    const plainData = Object.fromEntries(formData.entries());
    return await fetchJson(HttpMethod.POST, url, plainData);
}

export async function postFormMultipart(url, formData, token) {
    const plainData = Object.fromEntries(formData.entries());
    return await fetch(
        url, {
        method: HttpMethod.POST,
        body: plainData,
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": token
        }
    }
    );
}