import axios from "axios";
import { useState,useEffect,createContext } from "react";
import Tags from "./Tags";
import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs";
import useAuthStore from "@/zustand/authStore";
import FullScreenSpinner from "@/components/FullScreenSpinner";
import useLoadStateStore from "@/zustand/loadStateStore";
import BlogCard from "@/components/BlogCard";
export const searchTags = createContext();
export default function SearchForBlogs(){
    const [loading,setLoading] = useState(false)
    const [addingtag,setAddingTag] = useState([])
    const [sendingtags,setSendingTags] = useState([])
    const [search123,setSearch123] = useState([])
    const isAuth = useAuthStore((state) => state.isAuth);
    const authdata = useAuthStore((state) => state.authdata);
    const setIsLoading = useLoadStateStore((state) => state.setIsLoading);
    const [blogs, setBlogs] = useState([]);
    const [followerBlogs, setFollowerBlogs] = useState([]);
    const [sharedBlogs, setSharedBlogs] = useState([]);
    useEffect(() => {
      setSearch123(addingtag);
      setLoading(true);

      const loadAll = async () => {
        try {
          if (addingtag.length === 0) {
            const [all, follows, shared] = await Promise.all([
              getPublicBlogsWithNoTags(authdata, setIsLoading),
              getPublicBlogsWithNoTagsAndFollows(authdata, setIsLoading),
              getPublicBlogsWithNoTagsAndShared(authdata, setIsLoading),
            ]);
            setBlogs(all);
            setFollowerBlogs(follows);
            setSharedBlogs(shared);
          } else {
            const [all, follows, shared] = await Promise.all([
              getPublicBlogsWithTags(authdata, setIsLoading, addingtag),
              getPublicBlogsWithTagsAndFollows(
                authdata,
                setIsLoading,
                addingtag
              ),
              getPublicBlogsWithTagsAndShared(
                authdata,
                setIsLoading,
                addingtag
              ),
            ]);
            setBlogs(all);
            setFollowerBlogs(follows);
            setSharedBlogs(shared);
          }
        } catch (error) {
          console.error("Error loading blogs:", error);
        } finally {
          setLoading(false);
        }
      };

      loadAll();
    }, [addingtag, sendingtags]);

    if(loading){
        return(
            <FullScreenSpinner/>
        )
    }
    return(<div className="flex p-8 md:flex-nowrap flex-wrap ">
        <div className="px-3 py-10 ">
            <searchTags.Provider value={{search123,setAddingTag}}>
                <Tags />
            </searchTags.Provider>
        </div>
        <div className="p-2 grow">
          <Tabs defaultValue="feed">
            <TabsList className="flex gap-4 overflow-auto pb-2 border-b-0">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="for-you">For You</TabsTrigger>
              {/* <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger> */}
            </TabsList>
                <div className="pb-3">
                    {addingtag.length===0?<h3 className="text-4xl font-bold pb-4 mt-4">Recently Added</h3>
                    :<div><h1 className="text-5xl font-bold pb-5">Search Based on Tags</h1>
                    <div className="flex flex-wrap gap-2">
                        {addingtag.map((tag)=>{
                            return(<h1 className="inline-block rounded-lg bg-gray-100 px-2 py-1 text-lg dark:bg-gray-800">{tag.tagname}</h1>)
                        })}
                    </div>
                    </div>}
                </div>
            <TabsContent value="feed">
                {/* ALL BLOGS */}
                {blogs.map((blog)=>{return<BlogCard key={blog.id} blog={blog} />})}    
            </TabsContent>
            <TabsContent value="for-you">
              {/* FOLLOWING ONLY BLOGS */}
              {followerBlogs.map((blog)=>{return<BlogCard key={blog.id} blog={blog} />})}   
            </TabsContent>
           <TabsContent value="shared-with-me">
              {/* FOLLOWING ONLY BLOGS */}
              {sharedBlogs.map((blog)=>{return<BlogCard key={blog.id} blog={blog} />})}   
            </TabsContent>
          </Tabs>
          
        </div>
        
    </div>)
}

async function getPublicBlogsWithNoTags(authdata,setLoading){
    const response = await axios.post(`http://localhost:3000/noTags`,{});
    // console.log(response.rows);
    return response.data.rows;
}
async function getPublicBlogsWithTags(authdata,setLoading,addingtag){
    const tags1 = await Promise.all(addingtag.map(async (tag) => {
        return tag.id; 
    }));
    const response = await axios.post(`http://localhost:3000/withTags`,{tags1});
    console.log(response.data.rows,tags1);
    return response.data.rows;
}

async function getPublicBlogsWithNoTagsAndFollows(authdata,setLoading){
    const response = await axios.post(`http://localhost:3000/noTagsWithFollows`,{userId:authdata.id});
    // console.log(response.rows);
    return response.data.rows;
}

async function getPublicBlogsWithTagsAndFollows(authdata,setLoading,addingtag){
    const tags1 = await Promise.all(addingtag.map(async (tag) => {
        return tag.id; 
    }));
    const response = await axios.post(`http://localhost:3000/withTagsAndFollows`,{tags1,userId:authdata.id});
    // console.log(response.data.rows,tags1);
    return response.data.rows;
}


async function getPublicBlogsWithNoTagsAndShared(authdata,setLoading){
    const response = await axios.post(`http://localhost:3000/noTagsWithShare`,{userId:authdata.id});
    // console.log(response.rows);
    return response.data.rows;
}

async function getPublicBlogsWithTagsAndShared(authdata,setLoading,addingtag){
    const tags1 = await Promise.all(addingtag.map(async (tag) => {
        return tag.id; 
    }));
    const response = await axios.post(`http://localhost:3000/withTagsAndShare`,{tags1,userId:authdata.id});
    // console.log(response.data.rows,tags1);
    return response.data.rows;
}