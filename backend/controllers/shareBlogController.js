import { shareBlog } from "../sql/queries/blog.js";

export async function ShareBlogs(connection , req , res) {
    try{
        const {blog_id,users} = req.body;
        for(const user_id of users){
            const [rows,fields] = await shareBlog(connection, user_id.id,blog_id);
        }
        res.status(200).json({result :true})
    } catch(err) {
        console.log(err);
        res.status(500).json({message : 'Internal Server Error'})
    }
}