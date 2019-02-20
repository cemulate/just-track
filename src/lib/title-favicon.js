export function changePageTitle(text) {
    let title = document.getElementsByTagName('title')[0];
    if (title != null) title.innerHTML = text;
}
