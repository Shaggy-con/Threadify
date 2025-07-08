import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import 'quill/dist/quill.snow.css'
import { io } from "socket.io-client";
import { useParams,useNavigate, json } from "react-router-dom";
import useAuthStore from "../zustand/authStore";
import useLoadStateStore from "@/zustand/loadStateStore";
import { Button } from "@/components/ui/button";
import axios from "axios";


export default function CollabBlogPage(){
    const navigate = useNavigate()
    const isAuth = useAuthStore((state) => state.isAuth);
    const setIsLoading = useLoadStateStore((state) => state.setIsLoading);
    const authData = useAuthStore((state) => state.authdata);
    const [socket,setSocket] = useState()
    const [quill,setQuill] = useState()
    const [hasContent,setHasContent] = useState(false)
    const wrapperRef = useRef()
    const {id} = useParams()
    const [title,setTitle] = useState('')
    const [owner,setOwner] = useState(false)
    useEffect(()=>{
        const editor = document .createElement('div')
        wrapperRef.current.append(editor)
        const q = new Quill(editor,{theme:"snow"})
        setQuill(q);
        q.disable()
        return()=>{
            wrapperRef.innerHTML =""
        }
    },[])
    useEffect(()=>{
        const s = io(import.meta.env.VITE_BACKEND_URL)
        setSocket(s)
        s.emit('joinRoom',{id:id,user_id: authData.id})
        return()=>{
            s.disconnect()
        }
    },[])
    useEffect(()=>{
        if(socket==null || quill==null) return
        //if(!hasContent) return
        const handelWelcome = (data) =>{
            console.log(data);
            if(data.error){
                alert('Inernal Server Error')
                navigate('/dashboard');
            }
            if(!data.hasAcces){
                alert('You dont have Access')
                navigate('/dashboard');
            }
            setTitle(data.title);
            setHasContent(true)
            setOwner(data.owner)
            quill.setContents(JSON.parse(data.content))
            quill.enable();
        }
        socket.on('welcome',handelWelcome)
        return()=>{
            socket.on('welcome',handelWelcome)
        }
    },[socket,quill])
    useEffect(()=>{
        if(socket==null || quill==null) return
        if(!hasContent) return
        const handelChange = (delta,oldDelta,source)=>{
            
            if(source!=='user')return
            socket.emit('changes',{delta:delta,id:id});
        }
        quill.on('text-change',handelChange)
        return()=>{
            quill.off('text-change',handelChange)
        }
    },[socket,quill,hasContent])

    useEffect(()=>{
        if(socket==null || quill==null) return
        if(!hasContent) return
        const handelMerge = (delta)=>{
            quill.updateContents(delta)
        }
        socket.on('merge',handelMerge)
        return()=>{
            socket.off('merge',handelMerge)
        }
    },[socket,quill,hasContent])

    useEffect(()=>{
        if(socket==null || quill==null) return
        if(!hasContent) return
        
        const interval = setInterval(()=>{
            socket.emit('save-doc',{id:id,content: quill.getContents()})
        },2000)

        return()=>{
            clearInterval(interval)
        }
    },[socket,quill,hasContent])

    const handelPublish = async() =>{
        const htmlFromOfQuill  = quill.getSemanticHTML();
        try {
            const res = await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/fromCollabToBlog",
                {
                  blog_id: id,
                  html:htmlFromOfQuill,
                  title: title,
                  user_id : authData.id,
                  isPublic: true
                }
            );
            alert('Done')
            navigate('/dashboard')
          } catch (error) {
            console.log(error)
          }
        
    }

    return(
        <>
        <div className="flex-col justify-center items-center">
        <div className="text-4xl font-bold text-center p-3">{title}</div>
        <div className="flex pt-5 justify-center items-center w-full">
            {owner && <Button className='mx-auto' onClick={(e)=>{e.preventdefault;handelPublish()}}>Publish</Button>}
        </div>
        <div className="flex w-full">
            <div className="w-full">
            <div id='container' className="py-6 px-10 md:px-10 md:py-12 lg:py-16 lg:w-3/5 mx-auto h-screen" ref={wrapperRef}>
            
            </div>
            </div>
        </div>
        
    </div>
    </>
    )
}