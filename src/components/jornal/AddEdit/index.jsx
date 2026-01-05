import React,{ useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectItem,
    SelectContent,
    SelectValue
} from "@/components/ui/select";
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from 'uuid';

const AddEdit = ({id}) => {
  const router = useRouter()
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");

  
  let emptyForm = {
    title: "",
    content: "",
    mood_id: ""
  }
  const [form, setForm] = useState(emptyForm);
  const [errors,setErrors] = useState({
    content: "",
    mood_id: ""
  })

    useEffect(() => {
        api.get(`journal/categories/`)
        .then((res) => {
            setMoods(res.data)
        } )
        .catch(err => console.log(err,"hello err"))
    }, []);


    const handleFormChange = (e) => {
      const {name,value} = e.target
      setForm(prev => ({
        ...prev,
        [name]:value
      }))
      setErrors(prev => ({
        ...prev,
        name:"",
      }))
    }
    const handleMoodChange = (value) => {
      setForm(prev => ({ ...prev, mood_id: value }));
      setErrors(prev => ({ ...prev, mood_id: "" }));
    };
    const handleContentChange = (value) => {
        setForm(prev => ({ ...prev, content: value }));
    };

    const handleFormValidation = () => {
        let newErrors = {};

        if (!form.content.trim() && !audioBlob) {
            newErrors.content = "Please write something in your entry.";
        }

        if (!form.mood_id) {
            newErrors.mood_id = "Please select a mood.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    const handleSubmit = async () => {
        let isFormValid = handleFormValidation()
        if(!isFormValid) return

        setLoading(true);

        const formData = new FormData();
        let uuid = form.uuid || uuidv4()
        formData.append("title", form.title);
        formData.append("content", form.content);
        formData.append("mood_id", form.mood_id);
        formData.append("uuid", uuid);

        if (audioBlob) {
          formData.append("audio_file", audioBlob, "voice-journal.mp3");
        }
        
        let url = id ? `/journal/${id}/` : "/journal/"
        let method = id ? "PUT" : "POST"

        api({
            url,
            method,
            data:formData
        }).then(() => {
            router.push("/journal")
            setForm(emptyForm)
        })
        .catch(err => console.log(err,"hello err"))
        .finally(() => setLoading(false))
    };

    useEffect(() => {
        let fetchJournal = () => {
            api.get(`journal/${id}/`)
            .then(res => {
                setForm({...res.data,mood_id:res.data.mood.id})
            })
            .catch(err => console.log(err,"hello err"))
        }
        id && fetchJournal()
    }, [id]);

    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        setAudioBlob(e.data);
        setAudioUrl(URL.createObjectURL(e.data));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    };

    const stopRecording = () => {
      mediaRecorder.stop();
      setIsRecording(false);
    };


  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 page-container">
        <h1 className="page-title">
            {id ? "Edit Entry" :"Add Entry"}
        </h1>
        <div className="space-y-2">
        <Label>Title</Label>
        <Input
          placeholder="Optional"
          value={form.title}
          onChange={handleFormChange}
          className="rounded-xl"
          name={'title'}
        />
      </div>

      <div className={"formGroup"}>
          <label htmlFor="content">Your Thoughts</label>
          <ReactQuill
            value={form.content}
            onChange={handleContentChange}
            placeholder="Write your blog content here..."
          />
      </div>

      {errors.content && (
        <p className="error">{errors.content}</p>
      )}

      <div className="space-y-2">
        <Label>Mood</Label>
        <Select
          onValueChange={handleMoodChange}
          value={String(form.mood_id)}
          name="mood_id"
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select a mood" />
          </SelectTrigger>
          <SelectContent>
            {moods.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.mood_id && (
            <p className="error">{errors.mood_id}</p>
          )}
      </div>

      {/* <div className="space-y-2 mt-6">
        <Label>Voice Journal (Optional)</Label>

        {!audioUrl && !isRecording && (
          <button
            onClick={startRecording}
            className="bg-[#2E8B8B] text-white px-4 py-2 rounded-xl"
          >
            🎤 Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-4 py-2 rounded-xl"
          >
            ⏹ Stop Recording
          </button>
        )}

        {audioUrl && !isRecording && (
          <div className="space-y-2">
            <audio controls src={audioUrl} className="w-full" />

            <button
              onClick={() => {
                setAudioBlob(null);
                setAudioUrl("");
              }}
              className="bg-gray-300 px-4 py-2 rounded-xl"
            >
              🔁 Re-record
            </button>
          </div>
        )}
      </div> */}


      <div className="btn-container">
        <button
          onClick={handleSubmit}
          className="btn submit-btn"
        >
          { loading ? "Saving..." : id ? "Update Entry" : "Save Entry"}
        </button>
      </div>
    </div>
  )
}

export default AddEdit