function initButtonHandlers() {
    document.getElementById('getStarted').onclick = () => {
        fetch('http://127.0.0.1:5000/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to retrieve the home page; status {${response.status}`)
                }
                return response.text()
            })
            .then(html => {
                document.documentElement.innerHTML = html;
                loadHomePage();
            })
            .catch(error => console.err(error));
    };
}

window.onload = initButtonHandlers