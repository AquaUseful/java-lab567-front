/**
 * @param {Array} violations 
 * @param {HTMLElement} form 
 */
export async function displayViolations(violations, form) {
    console.log(violations);
    violations.forEach((v) => {
        console.log(v);
        let field = v.fieldName;
        let message = v.message;
        //console.log(field);
        let container = form.querySelector("#" + field + "Container");
        let input = form.querySelector("#" + field + "Group");
        let msg = form.querySelector("#" + field + "Message");

        console.log(container);

        container.classList.add("is-invalid");
        input.classList.add("is-invalid");
        msg.innerHTML = message;
    });
}

export async function clearViolations(fields, form) {
    fields.forEach((field) => {
        let container = form.querySelector("#" + field + "Container");
        let input = form.querySelector("#" + field + "Group");
        let msg = form.querySelector("#" + field + "Message");

        container.classList.remove("is-invalid");
        input.classList.remove("is-invalid");
        msg.innerHTML = "";
    });
}

export async function setGlobalAlert(form, string) {
    let alert = form.querySelector("#globAlert");
    alert.innerHTML = string;
    alert.classList.remove("d-none");
}

export async function clearGlobalAlert(form) {
    let alert = form.querySelector("#globAlert");
    alert.classList.add("d-none");
}

