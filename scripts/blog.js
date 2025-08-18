// @ts-nocheck

const toolbarOptions = [
    // Text styling options
    ['bold', 'italic', 'underline', 'strike'], // Toggled buttons
    [{ 'color': [] }, { 'background': [] }],  // Text color and background

    // Headers and blockquote
    [{ 'header': [1, 2, 3, false] }],          // Simplified header options
    ['blockquote', 'code-block'],             // Block-level options

    // Lists and indentation
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],  // Lists
    [{ 'indent': '-1' }, { 'indent': '+1' }],       // Outdent/indent

    // Alignment and direction
    [{ 'align': [] }],                           // Alignment options
    ["link", "image", "video"],
    // [{ 'direction': 'rtl' }],                    // Text direction (RTL)

    // Subscript and superscript
    [{ 'script': 'sub' }, { 'script': 'super' }],

    // Fonts and clean formatting
    [{ 'font': [] }],                             // Font family
    // ['clean'],                                    // Remove formatting button
];
const quill = new Quill("#blog-editor", {
    theme: "snow",
    modules: {
        syntax: true,
        toolbar: toolbarOptions
    }
});
// quiil.import("delta")

// module.exports = quill

/**
 * 
 * @param {Event} event 
 * @param {string} post_id 
 */
function handleSubmit(event, post_id) {
    event.preventDefault()
    console.log('Hello there')
    const html = quill.getSemanticHTML()
    console.log(html)
}

/**
 * 
 * @param {boolean} publish 
 */
async function saveBlogAndPublish(publish) {
    try {
        const html = quill.getSemanticHTML();
        const data = { id: blog_id, data: { content: html, publish } }
        console.log({ data })
        const response = await fetch("/blog/save", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': "application/json"
            }
        });
    } catch (error) {
        console.error(error)
    }
}


async function publish() {
    await saveBlogAndPublish(true)
}

async function saveDraft() {
    await saveBlogAndPublish(false)
}


let PublishBtn = document.getElementById("publish-btn")
PublishBtn.addEventListener("click", publish)

let SaveDraftBtn = document.getElementById("save-draft-btn");
SaveDraftBtn.addEventListener("click", saveDraft);

