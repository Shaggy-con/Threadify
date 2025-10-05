import { checkIfUserHasAcces, deleteCollabBlog, deleteCollabTags, deleteCollabUsers, getCollabBlogData, getCollabTags, updateDoc } from "../sql/queries/collabBlog.js";
import TurndownService from 'turndown'
import { addTagsNewBlog, createBlog, getNewBlog } from "../sql/queries/newBlog1.js";

export async function JoinAUser(connection,socket,data){
    const {id,user_id} = data;
    const result = {}
    try {
        
        const [rows,feild] = await checkIfUserHasAcces(connection,id,user_id);
        if(rows[0].c === 0){
            result.hasAcces = false;
            result.hasContent = false;
            result.error = false;
            socket.emit('welcome', result);
            return
        }
        result.hasAcces = true;
        result.hasContent = true;
        const [rows1,feilds1] = await getCollabBlogData(connection,id);
        result.content = rows1[0].content;
        
        result.error = false
        result.title = rows1[0].title;
        if(rows1[0].user_id===user_id){
            result.owner = true;
        }
        else{
            result.owner = false
        }
        socket.join(id);
        socket.emit('welcome', result);
        return
    } catch (error) {
        console.log(error)
        result.error = true;
        socket.emit('welcome', result);
        return
    }
}


export async function SaveDoc(connection,socket,data){
    const {id,content} = data;
    try {
        //console.log({y:JSON.stringify(content)},'hi')
        const y = JSON.stringify(content)
        updateDoc(connection,id,y)
    } catch (error) {
        console.log(error)
    }
}


async function tagsAdder(connection,row,tags1){
    const result = []
    for(const tag of tags1){
        const [rows123 , fields] = await addTagsNewBlog(connection, row.id,tag.tag_id)
    }
}

export async function convertBlog(connection,req,res){
    const {html,blog_id,title,user_id,isPublic} = req.body;
    try {
        const turndownService = new TurndownService();
        const markdown = turndownService.turndown(html)
        const [tags,f] = await getCollabTags(connection,blog_id)
        await deleteCollabTags(connection,blog_id)
        await deleteCollabUsers(connection,blog_id)
        await deleteCollabBlog(connection,blog_id)
        const [rows , fields] = await createBlog(connection, user_id, title,markdown,isPublic)
        const [rows1 , fields1] = await getNewBlog(connection, user_id, title,markdown,isPublic)
        await tagsAdder(connection,rows1[0],tags)   
        res.status(200).json({result : "Done"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message : 'Internal Server Error'})
    }
    
}