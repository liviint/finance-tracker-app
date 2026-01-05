"use client"
import {useState,useEffect} from "react"
import { useSelector } from "react-redux";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "api";
import ProtectedAccessPage from "@/components/common/ProtectedAccessPage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { longDateFormat } from "@/helpers";

export default function JournalListPage() {
    const isUseroggedIn = useSelector(state => state?.user?.userDetails);
    const [journals,setJournals] = useState([])

    useEffect(() => {
        let fetchJournals = () => {
            api.get(`/journal/`).then(res => {
                setJournals(res.data.results)
            })
            .catch(err => console.log(err,"hello err"))
        }
        fetchJournals()
    },[])

  if(!isUseroggedIn) return (
    <ProtectedAccessPage 
      message={"Your personal journal is waiting. Sign up or log in to continue."}
    />)
  return (
    <div className="p-6 max-w-3xl mx-auto page-container">
      <div className="mb-6">
        <h1 className="page-title">My Journal</h1>

        <div className="btn-container">
          <Link href="/journal/create">
            <Button
              className="btn"
            >
              + New Entry
            </Button>
        </Link>
        <Link href="/journal/stats">
            <Button
              className="btn"
            >
              Stats
            </Button>
        </Link>
        </div>

      </div>

      <div className="grid gap-6">
        {journals.map((item) => (
          <Link key={item.id} href={`/journal/${item.id}`}>
            <Card className="rounded-2xl bg-white cursor-pointer transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="space-y-2 pb-2">
                {/* Title + Mood */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[var(--text)] line-clamp-2">
                    {item.title || "Untitled"}
                  </h2>

                  {item.mood && (
                    <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--text)]">
                      {item.mood.name}
                    </span>
                  )}
                </div>

                {/* Date */}
                <p className="text-xs text-gray-500">
                  {longDateFormat(item.created_at)}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Preview Text */}
                <article className="prose prose-sm max-w-none text-gray-700 line-clamp-3">
                  <ReactMarkdown
                    children={
                      item.content
                        .slice(0, 200)
                        .replace(/\\n/g, "\n")
                        .replace(/\n(?!\n)/g, "  \n")
                    }
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  />
                </article>

                {/* Audio Player */}
                {item.audio_file && (
                  <div className="mt-2">
                    <audio controls className="w-full rounded-md">
                      <source src={item.audio_file} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                {/* Transcript Preview */}
                {item.transcript && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {item.transcript.length > 150
                      ? `${item.transcript.slice(0, 150)}...`
                      : item.transcript}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}


      </div>
    </div>
  );
}
