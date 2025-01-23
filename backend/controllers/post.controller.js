import User from "../models/user.model.js";
import cloudinary from "cloudinary";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

export const createPost = async(req, res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();

        const user = await User.findOne({_id : userId})
        if(!user){
            return res.status(400).json({error: "User not found"})
        }

        if(!text && !img) {
            return res.status(400).json({error: "Post must have text or image"})
        }

        if(img){
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url;
        }
        const newPost = new Post({
            user: userId,
            text,
            img
        })
        await newPost.save();
        res.status(201).json(newPost);
        
    } catch (error) {
        console.log(`Error in createPost controller: ${error}`);
        res.status(500).json({error: "Internal Server Error"});
    }
} 

export const deletePost = async(req, res) => {
    try {
        const {id} = req.params;
        const post = await Post.findOne({_id: id});
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error: "You can only delete your own posts"});
        }
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete({_id: id});

        res.status(200).json({message: "Post deleted successfully"});
        
    } catch (error) {
        console.log(`Error in deletePost controller: ${error}`);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const createComment = async(req, res) => {
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ error: "Comment text is required" });
          }

        const post = await Post.findOne({_id: postId});
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        const comment = {
            user: userId,
            text
        }

        post.comments.push(comment);
        await post.save();
        res.status(200).json(post);
        
    } catch (error) {
        console.log(`Error in createComment controller: ${error}`);
        res.status(500).json({error: "Internal Server Error"});
    }
}   

export const likeUnlikePost = async(req, res) => {
    try {
        const userId = req.user._id;
        const {id: postId} = req.params;

        const post = await Post.findOne({_id: postId});
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        const userLikedPost = post.likes.includes(userId);
        if(userLikedPost){
            //unlike the post
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            res.status(200).json({message: "Post unliked successfully"});
        }
        else{
            //like the post
            post.likes.push(userId);
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })
            await notification.save();
            res.status(200).json({message: "Post liked successfully"});
        }
        await post.save();
        res.status(200).json(post);
        
    } catch (error) {
        console.log(`Error in likeUnlikePost controller: ${error}`);
        res.status(500).json({error: "Internal Server Error"});
    }
        }
