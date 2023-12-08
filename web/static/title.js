function initButtonHandlers() {
    document.getElementsByClassName('greenButton')[0].onclick = () => {
        const currentUrl = window.location.href;
        const newUrl = currentUrl + 'home';

         window.history.pushState({ path: newUrl }, '', newUrl);
         location.reload();
    };
}

window.onload = initButtonHandlers
