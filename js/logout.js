async function main() {
    localStorage.removeItem("token");
    document.location.replace("main.html");
}

document.addEventListener("DOMContentLoaded", main);