'use client'
import {useState,useEffect} from 'react'
import { useParams, useRouter } from 'next/navigation';
import { api } from 'api';
import Loader from '@/components/common/FullScreenLoader';

const Page = () =>  {
    const router = useRouter()
    const {id} = useParams()
    const [habit, setHabit] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHabit = () => {
            api.get(`/habits/${id}/`)
            .then((res) => {
                console.log(res,"hello res")
                setHabit(res.data)
            })
            .catch(err => {
                console.log(err,"hello err")
            })
            .finally(() => setLoading(false))
        };
        fetchHabit();
    }, [id]);


if (loading) return <Loader />
return (
    <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#FF6B6B]">{habit.title}</h1>
        <button
            onClick={() => router.push(`/habits/${habit.id}/edit`)}
            className="text-[#2E8B8B] text-sm hover:underline mr-2"
        >
            Edit Habit
        </button>
        <button
            onClick={() => router.push(`/habits/${habit.id}/stats`)}
            className="text-[#2E8B8B] text-sm hover:underline"
        >
            View Stats
        </button>
        <p className="text-gray-700 mt-2">{habit.description}</p>
    </div>
);
}

export default Page