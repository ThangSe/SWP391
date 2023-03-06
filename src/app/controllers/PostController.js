const Post = require("../models/Post")
const Tag = require("../models/Tag")
const Account = require("../models/Account")

class PostController{
    async createNewPost(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const author_id = accountInfo.id
            const tagName = req.body.tag
            const existedTag = await Tag.findOne({type: tagName})
            if(!existedTag) {
                newTag = new Tag({
                    type: tagName
                })
                existedTag = await newTag.save()
            }
            const post = new Post({
                title: req.body.title,
                content: req.body.content,
                author_id: author_id,
                tag_id: existedTag.id
            })
            const savePost = await post.save()
            await Account.findByIdAndUpdate({_id: author_id}, {$push: {post_id: savePost.id}})
            // req.ticket = saveTicket
            // req.message = "Tạo đơn thành công"
            res.status(200).json("Tạo bài đăng thành công")
        } catch (err) {
            res.status(500).json(err)
        }
    }

}

module.exports = new PostController()
