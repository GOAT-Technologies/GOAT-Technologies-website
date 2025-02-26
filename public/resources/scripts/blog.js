// @ts-nocheck

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'header': [1, 2, 3, false] }],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ["link", "image", "video"],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'font': [] }],
];

const quill = new Quill("#blog-editor", {
    theme: "snow",
    modules: {
        syntax: true,
        toolbar: toolbarOptions
    }
});

async function saveBlog(publish) {
    try {
        const html = quill.getSemanticHTML();
        const data = { id: blog_id, data: { content: html, publish } };
        const response = await fetch("/blog/save", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { 'Content-Type': "application/json" }
        });
        if (response.ok) {
            console.log('Blog saved successfully');
        } else {
            console.error('Failed to save blog');
        }
    } catch (error) {
        console.error(error);
    }
}

document.getElementById("publish-btn").addEventListener("click", () => saveBlog(true));
document.getElementById("save-draft-btn").addEventListener("click", () => saveBlog(false));

