//авторизация разных ролей
const userCb = document.getElementById("test-user-role");
const adminCb = document.getElementById("test-admin-role");
const editorCb = document.getElementById("test-editor-role");

const adminPanelButton = document.getElementById("admin-panel-button");
const editorPanelButton = document.getElementById("editor-panel-button");
const userPanelButton = document.getElementById("user-request-button");

export async function displayUserButtons() {
    adminPanelButton.innerHTML = ``;
    editorPanelButton.innerHTML = ``;
    userPanelButton.innerHTML = `<button type="button" class="btn btn-primary"
    data-bs-toggle="modal" data-bs-target="#userRequestModal">Список записей на
    приём</button>`;
}

export async function displayAdminButtons() {
    adminPanelButton.innerHTML = `<button type="button" class="btn btn-danger admin-button"
        data-bs-toggle="modal" data-bs-target="#adminModal">Панель админа</button>`;
    editorPanelButton.innerHTML = ``;
    userPanelButton.innerHTML = ``;
}

export async function displayEditorButtons() {
    adminPanelButton.innerHTML = ``;
    editorPanelButton.innerHTML = `<button type="button" class="btn btn-success editor-button"
    data-bs-toggle="modal" data-bs-target="#editorModal">Панель редактора</button>`;
    userPanelButton.innerHTML = ``;
}

//типа появился 4 юзер

//таким же способом можно удалить карточку юзера из списка в панели
//или через userContainer.removeChild(userCard);


//полагаю, что таким же способом можно визуально добавлять и удалять заявки юзера в раздел "Редактировать пользователя"
//а также новости из раздела "Панель редактора" и комментарии из раздела "Редактировать новость"
//да и добавление новости на мейн странице я делал бы также












//ещё немного насраного текста и мыслей по поводу лабы
//У меня добавлено три юзера: редактор, обычный чел и админ.можно обойтись и без редактора, но тогда там надо будет чутка переделать интерфейсыч
//сайт, где я пиздил новости https://medsi.ru/about/press-centr/
//Лайки есть, комменты тоже, но никто не сказал, что комменты должны отображаться на мейн странице, поэтому они будут идти по каждой новости в редакт-меню и там хранится, ибо таташкин ебнулся