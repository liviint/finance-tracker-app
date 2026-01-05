"use client";
import "../journal.css"
import AddEdit from "@/components/jornal/AddEdit";

export default function CreateJournalPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <AddEdit />
    </div>
  );
}
