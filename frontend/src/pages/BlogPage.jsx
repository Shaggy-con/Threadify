import React, { useEffect, useState ,useRef} from "react";
import { useParams } from "react-router-dom";
import { useNavigate,Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/zustand/authStore";
import Markdown from "react-markdown";
import useLoadStateStore from "@/zustand/loadStateStore";
import { ArrowUpIcon ,ArrowDownIcon } from "lucide-react";
import axios from "axios";

export default function BlogPage() {
  const usernameref = useRef();
  const { id } = useParams();
  const navigate = useNavigate();
  const bid = id;
  const isAuth = useAuthStore((state) => state.isAuth);
  const setIsLoading = useLoadStateStore((state) => state.setIsLoading);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const authData = useAuthStore((state) => state.authdata);
  const [votecount,setVoteCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [allfriends,setAllFriends] =useState([])
  const [friendsSet,setFriendsSet] = useState(new Set())
  const [searchVal,setSearchVal] = useState("")

const handelSearch = async()=>{
    setIsLoading(true)
    setSearchVal(usernameref.current.value)
    setIsLoading(false)
}
const handleAdd = (e) => {
    setIsLoading(true)
    setFriendsSet(prevSet => new Set(prevSet).add(e));
    
    setIsLoading(false)
  };
  const handleRemove = (item) => {
    setFriendsSet(prevSet => {
      const newSet = new Set(prevSet);
      newSet.delete(item);
      return newSet;
    });
  };
    useEffect(()=>{
        setIsLoading(true);
        setIsLoading(true)
        const getMyFriends = async()=>{
            const res = await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/myfriends",
                {
                  user_id: authData.id,
                }
            );
            const data = res.data;
            setAllFriends(data.friends)
            setIsLoading(false)
        }
        try {
            getMyFriends()
        } catch (error) {
            console.log(error)
        }
        finally{
            setIsLoading(false)
        }
    },[])
  useEffect(() => {
    setIsLoading(true);
    const getContent = async () => {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/dashboard/blog",
        {
          blog_id: bid,
        }
      );
      // console.log(res);
      const data = res.data;
      const rows1 = data["rows"];
      setRows(rows1[0]);
      setVoteCount(rows1[0]["u"] - rows1[0]["d"]);
    };
    getContent();

    // check if upvoted or downvoted
    getVoteStats(bid, authData).then((res) => {
      if (res["checkupvote"] === 1) {
        setUpvoted(true);
      }
      if (res["checkdownvote"] === 1) {
        setDownvoted(true);
      }
    });    
    setIsLoading(false);
  }, [bid]);

  async function handleUpvote() {
    if (isAuth) {
      await upvoteBlog(bid, authData, downvoted );
      setUpvoted(true);
      if(downvoted) setDownvoted(false)
      else setUpvoted(true)
      setVoteCount(votecount + 1);
    } else {
      navigate("/login");
    }
  }

  async function handleDownvote() {
    if (isAuth) {
      await downvoteBlog(bid, authData, upvoted);
      setDownvoted(true);
      if(upvoted) setUpvoted(false)
      else setDownvoted(true)
      setVoteCount(votecount - 1);
    }
  } 
  const handelShare = async() =>{
      try {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/share",
          {
            blog_id:bid,
            users:[...friendsSet]
          }
      );
      alert('Done')
      navigate('/blogs')
      } catch (error) {
        console.log(error)
      }
  }

  const date = new Date(rows["publishedAt"]);

  return (
    <>
      <div className=" py-6 md:py-12 lg:py-16 lg:w-4/5 mx-auto">
        <Button onClick={()=>navigate(-1)} className=" my-6">{"< Go Back "}</Button>
        <div className="flex">
                <div className="py-10 flex-col">
                <Button onClick={(e)=>{e.preventdefault;handelShare()}} className=" p-5 m-3 grow bg-black">{"Share"}</Button>
                <div className="grow m-3 p-5">
                                    <div className="p-3 text-lg font-semibold">Added Friends</div>
                                    <div>
                                        {
                                            Array.from(friendsSet).map((e,i)=>{
                                                return(
                                                    <div className="flex space-x-3 m-2 " key={`Added${i}`}><Link to={`/writers/${e.id}`} key={e.id} className=" no-underline">{e.username}</Link>
                                                    <Button onClick={(er)=>{er.preventdefault;handleRemove(e)}} className="bg-black">Remove</Button>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                                <div className="grow m-3 p-5">
                                <div className="p-3 text-lg font-semibold">Search for Friends</div>
                                    <input type="text" ref={usernameref} className="flex w-full rounded-md 
                                    border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
                                    placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
                                    disabled:cursor-not-allowed disabled:opacity-50 text-lg 
                                    font-normal tracking-tight border-0 box-shadow-none h-auto" id="title" placeholder="Friends Username"/>
                                    <Button onClick={(er)=>{er.preventdefault;handelSearch()}} className="bg-black">Search</Button>
                                    <div>
                                    {   
                                        allfriends.length!==0?
                                        allfriends.map((e,i)=>{
                                            if(friendsSet.has(e) || !e.username.includes(searchVal))
                                                return(<></>)
                                            
                                            return(
                                                
                                                <div className="flex space-x-3 m-2 " key={i}><Link to={`/writers/${e.id}`} key={e.id} className=" no-underline">{e.username}</Link>
                                                <Button onClick={(er)=>{er.preventdefault;handleAdd(e)}} className="bg-black">Add</Button>
                                                </div>
                                            )
                                        }):"No Results"
                                    }
                                    </div>
                                </div>
                                
                            </div>
        <div>                  
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
            {rows["title"]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Posted on {date.toDateString()}
          </p>
        </div>
        <div className=" mx-auto py-6">
          <Markdown className="prose flex-grow min-w-full">{rows["content"]}</Markdown>
        </div>
        <div className="flex flex-row gap-2 place-items-center">
          <span className="text-sm font-semibold">{votecount} upvotes</span>
            <div className="flex items-center space-x-2">
              <Button onClick={() => !upvoted &&handleUpvote() } className={`h-10 ${upvoted && 'bg-gray-200 hover:bg-gray-200'}`} variant="outline">
                <ArrowUpIcon size={16} />
              </Button>
              
            </div>
            <div className="flex items-center space-x-2 justify-self-end">
              <Button onClick={() => !downvoted &&handleDownvote() } className={`h-10 ${downvoted && 'bg-gray-200 hover:bg-gray-200'}`} variant="outline">
                <ArrowDownIcon size={16} />
              </Button>
            </div>
        </div>
      </div>
      </div>
      </div>  
    </>
  );
}

/**************** HELPER FUNCTION ***********************/

// check if upvoted or downvoted
export async function getVoteStats(blog_id,authData) {
  try {
    const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/votes/checkvote", {
      params: {
        user_id: authData.id,
        blog_id: blog_id,
      },
    });
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

// upvote a blog
export async function upvoteBlog(blog_id, authData , isDownvoted) {
  try {
    if(isDownvoted) {
      // delete downvote
      await axios.post(import.meta.env.VITE_BACKEND_URL + "/votes/undownvote", {
        user_id: authData.id,
        blog_id: blog_id,
      });
    } else {
      // upvote
      await axios.post(import.meta.env.VITE_BACKEND_URL + "/votes/upvote", {
        user_id: authData.id,
        blog_id: blog_id,
      });
    }
  } catch (err) {
    console.log(err);
  }
}

// downvote a blog
export async function downvoteBlog(blog_id, authData , isUpvoted) {
  try {
    if(isUpvoted) {
      // delete upvote
      await axios.post(import.meta.env.VITE_BACKEND_URL + "/votes/unupvote", {
        user_id: authData.id,
        blog_id: blog_id,
      });
    } else {
      // downvote
      await axios.post(import.meta.env.VITE_BACKEND_URL + "/votes/downvote", {
        user_id: authData.id,
        blog_id: blog_id,
      });
    }
  } catch (err) {
    console.log(err);
  }
}