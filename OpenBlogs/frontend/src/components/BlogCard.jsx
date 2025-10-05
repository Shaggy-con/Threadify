import { Link } from "react-router-dom";
import { CardContent, Card } from "@/components/ui/card";
import RemoveMarkdown from "remove-markdown";
import {useState,useEffect,useContext} from 'react'


export default function BlogCard({ blog }) {
  return (
    <Card className="flex flex-col min-h-[300px] my-4">
      <Link className="flex-1 grid items-start p-6 gap-2 text-left" to={`/blog/${blog.id}`}>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold line-clamp-2">{blog.title}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Posted on {new Date(blog.publishedAt).toDateString()}
          </p>
          <p className="text-sm line-clamp-3">{RemoveMarkdown(blog.content)}</p>
        </div>
      </Link>
      <CardContent className="p-6 border-t">
        <div className="grid gap-2 text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            By 
            <Link to={`/writers/${blog.user_id}`} className=" text-black">{' '+blog.username}</Link>
          </p>
          {/* HARDCODED TAGS */}
          <div className="flex flex-wrap gap-2">
          {blog.tags.map((tag)=>{
            return(
              <Link
              key={tag.id}
              className="inline-block rounded-lg bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800"
              href=""
            >
              {tag.tagname}
            </Link>)
          })}
          
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
