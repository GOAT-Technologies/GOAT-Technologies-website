document.getElementById("new-blog-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const formData = new FormData(event.target);
        const response = await fetch("/blog/new", {
            method: "POST",
            body: formData
        });
        if (response.ok) {
            const result = await response.text();
            document.body.innerHTML = result;
        } else {
            console.error('Failed to create new blog');
        }
    } catch (error) {
        console.error(error);
    }
});