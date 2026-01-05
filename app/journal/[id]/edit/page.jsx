"use client";
import { useEffect, useState } from "react";
import { api } from "api";
import { useRouter } from "next/navigation";
import AddEdit from "@/components/jornal/AddEdit";

export default function EditJournalPage({ params }) {
  const router = useRouter();
  const id = params.id;

  const [entry, setEntry] = useState(null);
  const [moods, setMoods] = useState([]);

    useEffect(() => {
        let fetchJournal = () => {
            api.get(`journal/${params.id}/`)
            .then(res => {
                console.log(res,"hello res")
                setEntry(res.data)
            })
            .catch(err => console.log(err,"hello err"))
        }
        const fetchCategories = () => {
            api.get(`journal/categories/`)
            .then((res) => {
                console.log(res,"hello res")
                setMoods(res.data.results)
            } )
            .catch(err => console.log(err,"hello err"))
        }
        fetchJournal()
        fetchCategories()
    }, [id]);

  return <AddEdit id={id} />
}
