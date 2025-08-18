/**
 * 
 * @param {SubmitEvent} event 
 */
async function proceedToEditor(event) {
    try {
        // @ts-ignore
        const formData = new FormData(event.target);
        console.log({formData})
        const response = await fetch("/blog/new", {
            method: "POST",
            body: formData,
            headers: {
                'Content-Type': "multipart/form-data"
            }
        })
    } catch (error) {
        
    }
}


const NewBlogForm = document.getElementById("new-blog-form");
NewBlogForm.addEventListener("submit", proceedToEditor)