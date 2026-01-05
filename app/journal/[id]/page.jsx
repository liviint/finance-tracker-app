'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { longDateFormat } from "@/helpers";
import DeleteButton from "@/components/common/DeleteButton";

export default function ViewJournalPage({ params }) {
    let router = useRouter()
    const [entry,setEntry] = useState({})

    useEffect(() => {
        let fetchJournal = () => {
            api.get(`journal/${params.id}/`)
            .then(res => {
                console.log(res,"hello res")
                setEntry(res.data)
            })
            .catch(err => console.log(err,"hello err"))
        }
        fetchJournal()
    },[])

    const handleDelete = () => {
      api.delete(`journal/${params.id}/`)
            .then(res => {
                console.log(res,"hello res")
                router.push("/journal")
            })
            .catch(err => console.log(err,"hello err"))
    }

  return (
  <div className="p-6 max-w-2xl mx-auto space-y-6 page-container">
    <Card className="rounded-2xl shadow-md bg-white">
      <CardContent className="p-6 space-y-6">
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[var(--text)]">
            {entry.title || "Untitled"}
          </h1>

          {entry.mood && (
            <span className="inline-block bg-[var(--accent)] text-[var(--text)] text-xs font-medium px-3 py-1 rounded-full">
              {entry.mood.name}
            </span>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Created:</span> {longDateFormat(entry.created_at)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <span className="font-semibold text-gray-700">Updated:</span> {longDateFormat(entry.updated_at)}
          </p>
        </div>

        <hr className="border-gray-200" />

        <article className="prose prose-lg max-w-none text-[var(--text)] leading-relaxed">
          <ReactMarkdown
            children={entry?.content
              ?.replace(/\\n/g, "\n")
              ?.replace(/\n(?!\n)/g, "  \n")
            }
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          />
        </article>

        {/* Audio Player */}
        {entry.audio_file && (
          <div className="mt-4">
            <audio controls className="w-full rounded-md">
              <source src={entry.audio_file} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Full Transcript */}
        {entry.transcript && (
          <div className="mt-4 p-4 bg-[var(--accent)] rounded-lg text-[var(--text)] prose prose-sm">
            <h3 className="font-semibold mb-2">Transcript</h3>
            <p className="whitespace-pre-wrap">{entry.transcript}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <DeleteButton 
            handleOk={() => handleDelete(entry.id)}
            item={"Journal"}
            contentAuthor={entry.user}
          />
          <Link href={`/journal/${entry.id}/edit`}>
            <Button className="btn small-btn">
              Edit Entry
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  </div>
);


}
