"use client";
import Image from "next/image";
import Link from "next/link";
import { dateFormat } from "@/helpers";

export default function UserLinkBtn({ content }) {
  if (!content) return null;
  let author = content.author

  return (
    <div className="inline-flex items-start gap-3 w-fit">
      
      {/* Avatar + name wrapper clickable */}
      <Link
        href={`/profile/${author.id}`}
        className="
          inline-flex items-center gap-3 p-2 pr-3
          rounded-xl hover:bg-[#F4E1D2]/40 transition
        "
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#F4E1D2] flex items-center justify-center">
          {author.profilePic ? (
            <Image
              src={author.profilePic}
              alt={author.username}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <span className="text-[#2E8B8B] font-semibold text-sm">
              {author.username?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Name + Date */}
        <div className="flex flex-col">
          <span className="font-medium text-[#333333] hover:underline leading-tight">
            {author.username}
          </span>
          <span className="text-xs text-[#2E8B8B]/70">
            {dateFormat(content.created_at)}
          </span>
        </div>
      </Link>

    </div>
  );
}
