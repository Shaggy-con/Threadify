export async function getCollabBlogData(connection,blog_id){
    return await connection.query(
        `
            select title , user_id,content from collabblogs where id = ${blog_id}
        `
    )
}
export async function checkIfUserHasAcces(connection,blog_id,user_id){
    return await connection.query(
        `
        select count(*) as c from collabblog_users where user_id = ${user_id} and blog_id = ${blog_id};
        `
    )
}

export async function updateDoc(connection,blog_id,content){
    const x = {y:content}
    //console.log(x,"Hi1")
    return await connection.query(
        `
        update collabblogs set content = ? where id = ${blog_id};
        `,[x.y]
    )
}

export async function getCollabTags(connection,blog_id){
    return await connection.query(
        `
            select *from collabblog_tags where blog_id = ${blog_id};
        `
    )
}


export async function deleteCollabTags(connection,blog_id){
    return await connection.query(
        `
            delete from collabblog_tags where blog_id = ${blog_id};
        `
    )
}

export async function deleteCollabUsers(connection,blog_id){
    return await connection.query(
        `
            delete from collabblog_users where blog_id = ${blog_id};
        `
    )
}

export async function deleteCollabBlog(connection,blog_id){
    return await connection.query(
        `
            delete from collabblogs where id = ${blog_id};
        `
    )
}