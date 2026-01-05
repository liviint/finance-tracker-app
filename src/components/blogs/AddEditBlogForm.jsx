'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { api , blogApi} from "api";
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import classes from "./add-blog.module.css"

export default function AddEditBlogForm({blogId}) {
    const router = useRouter();
    const author = useSelector(state => state?.user?.userDetails)?.user?.id
    const [formData, setFormData] = useState({ 
        author,
        title: null, 
        content: "", 
        image: null,
        summary:"",
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState("");

    const getWordCount = (html) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        
        const words = text.trim().split(/\s+/).filter(Boolean);
        return words.length;
      };


    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        setFormData(prev => ({ ...prev, image: file }));
        setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e,isPublished) => {
        e.preventDefault();
        setLoading(true);
        setServerError("");
        setSuccess("");

        let form = new FormData()
        form.append("title",formData.title)
        form.append("author",formData.author)
        form.append("content",formData.content)
        form.append("summary",formData.summary)
        isPublished && form.append("published",true)
        if (formData.image instanceof File) {
            form.append("image", formData.image);
        }
        let url = blogId ? `/blogs/${blogId}/` : `/blogs/`
        let method = blogId ? 'PUT' : 'POST'
        api(url, {
                method,
                data: form,
        }).then(res => {
            setSuccess("Blog created successfully!");
            setPreview(null);
            if(isPublished){
                setTimeout(() => {
                    router.push("/blog/my-blogs")
                    setFormData({ title: null, content: "", image: null });
                  }, 1500);
            }
        })
        .catch(err => {
            console.log(err,"error")
            setServerError(err.message)
        })
        .finally(() =>  setLoading(false))
    };

    useEffect(() => {
        const fetchBlog = () => {
            blogApi.get(`blogs/${blogId}`)
            .then(res => {
                let blog = res.data
                setFormData(blog)
                blog.image && setPreview(blog.image)
            })
            .catch(error => console.log(error,"hello error"))
        }
        blogId && fetchBlog()
    },[blogId])

  return (
    <div className={"form-container"}>
      <div className={"form"}>
        <h2>
            {blogId ? "Edit a Blog" : "Add a New Blog"} 
        </h2>

        {serverError && <p className={"error"}>{serverError}</p>}
        {success && <p className={"success"}>{success}</p>}

        <div className={"formGroup"}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            name="title"
            placeholder="Enter blog title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className={"formGroup"}>
          <label htmlFor="content">Content</label>
          <ReactQuill
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Write your blog content here..."
          />
          <div className={classes["word-counter"]}>
            {getWordCount(formData.content)} {getWordCount(formData.content) === 1 ? 'word' : 'words'}
          </div>
        </div>

        <div className={"formGroup"}>
          <label htmlFor="summary">Summary</label>
          <textarea
            name="summary"
            placeholder="Enter blog summary"
            value={formData.summary}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>

        <div className={"formGroup"}>
          <label htmlFor="image">Cover Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {preview && (
            <div className={"image-preview"}>
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>
        <div className={classes['btns-container']}>
          <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={"btn"}
        >
          {loading ? "Posting..." : "Save as Draft"}
        </button>

        <button
          type="button"
          onClick={(e) => handleSubmit(e,true)}
          disabled={loading}
          className={"btn"}
        >
          {loading ? "Posting..." : "Publish Blog"}
        </button>
        </div>
      </div>

    </div>
  );
}
