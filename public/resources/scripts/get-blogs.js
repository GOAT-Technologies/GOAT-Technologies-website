let blogs = [];

const BlogItemTemplate = (blog) => (`
    <div role="listitem" class="blog-item w-dyn-item">
        <img src="/${blog.blog_lead_img}" alt="${blog.blog_title}" />
        <p>${blog.blog_title}</p>
        <p>${blog.blog_description}</p>
        <a href="/blog/${blog._id}/${blog.blog_title.replace(" ", "-")}">
            <div class="text-link-cta-wrapper text-color-turq">
                <div class="text-size-regular text-weight-bold">Read Full Blog</div>
                <div class="cards-cta-arrow w-embed">
                    <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.6893 7.25L6.96967 1.53033L8.03033 0.469666L15.5607 8L8.03033 15.5303L6.96967 14.4697L12.6893 8.75H0.5V7.25H12.6893Z" fill="currentColor"></path>
                    </svg>
                </div>
            </div>
        </a>
    </div>
`);

async function fetchBlogs() {
    try {
        const response = await fetch("/blog/all");
        const data = await response.json();
        if (data.status === "ok") {
            const latestBlogs = data.blogs.slice(0, 3).map(blog => BlogItemTemplate(blog)).join('');
            const allBlogs = data.blogs.map(blog => BlogItemTemplate(blog)).join('');
            document.getElementById("latest-blogs").innerHTML = latestBlogs;
            document.getElementById("blog-list").innerHTML = allBlogs;
        } else {
            console.error('Failed to fetch blogs');
        }
    } catch (error) {
        console.error(error);
    }
}

fetchBlogs();