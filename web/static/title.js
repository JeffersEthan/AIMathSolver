function initButtonHandlers() {
    document.getElementById('getStarted').onclick = () => {
        var currentUrl = window.location.href;

        var newUrl = currentUrl + 'home';

         window.history.pushState({ path: newUrl }, '', newUrl);
         location.reload();
        // fetch('http://127.0.0.1:5000/home')
        //     .then(response => {
        //         if (!response.ok) {
        //             throw new Error(`Failed to retrieve the home page; status {${response.status}`)
        //         }
        //         return response.text()
        //     })
        //     .then(html => {
        //         document.documentElement.innerHTML = html;
        //         loadHomePage();
        //     })
        //     .catch(error => console.error(error));
    };
}

window.onload = initButtonHandlers
